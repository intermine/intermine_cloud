"""Listen to Kubernetes events, filter and publish messages related to Argo
Workflows to NATS.
"""

import re
# import json
from typing import Dict, Optional

from kubernetes import client, config as kube_config, watch

from blackcap.messenger import messenger_registry
from blackcap.configs import config_registry


WORKFLOW_STATES = [
    'WorkflowRunning',
    'WorkflowSucceeded',
    'WorkflowFailed',
    'WorkflowTimedOut'
]
WORKFLOW_NODE_STATES = [
    'WorkflowNodeRunning',
    'WorkflowNodeSucceeded',
    'WorkflowNodeFailed',
    'WorkflowNodeError'
]

config = config_registry.get_config()
messenger = messenger_registry.get_messenger(config.MESSENGER)


def _parse_object(obj) -> Optional[Dict]:
    try:
        if obj.reason in WORKFLOW_NODE_STATES:
            # Event is for workflow **node** state change.

            # Annotations are only present for events of type ADDED.
            # Some events are only broadcasted with type MODIFIED without
            # annotations, so we have to read it from the message instead.
            node_name = obj.metadata.annotations['workflows.argoproj.io/node-name'] if obj.metadata.annotations else obj.message.split(' ')[-1]

            # This match also ensures we ignore events for
            # build-a-mine-9l4bh[7]
            # build-a-mine-9l4bh[0].start-postgres(0)
            # which are redundant.
            match = re.fullmatch(r"([\w\-]+)\[(\d+)\]\.([\w\-]+)", node_name)
            if not match:
                return None

            return {
                "status": obj.reason,
                "workflow_name": obj.involved_object.name,
                "current_step_number": int(match.group(2)),
                "current_step_name": match.group(3),
            }
        elif obj.reason in WORKFLOW_STATES:
            # Event is for workflow state change.

            return {
                "status": obj.reason,
                "workflow_name": obj.involved_object.name,
            }
    except KeyError:
        return None


def main(namespace: str) -> None:
    kube_config.load_kube_config()
    api = client.CoreV1Api()
    w = watch.Watch()

    for event in w.stream(api.list_namespaced_event, namespace, field_selector='involvedObject.kind=Workflow'):
        # Prior workflows will broadcast DELETED events when they get GC'ed, so
        # we have to filter those out so we won't publish them as being a
        # workflow in progress.
        if event['type'] in ['ADDED', 'MODIFIED']:
            message_event = _parse_object(event['object'])
            if message_event:
                messenger.publish({"data": message_event}, "mineprogress")
            # print(str(message_event))

        # print(json.dumps({'type': event['type'],
        #     'involved_object': {'name': event['object'].involved_object.name},
        #     'message': event['object'].message,
        #     'metadata': {'annotations': event['object'].metadata.annotations},
        #     'reason': event['object'].reason}, indent=4))
