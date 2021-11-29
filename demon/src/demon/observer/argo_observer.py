"""Listen to Kubernetes events, filter and publish messages related to Argo
Workflows to NATS.
"""

import re
from typing import Dict, Optional

from kubernetes import client, config, watch


def _parse_annotations(annotations: Dict[str, str]) -> Optional[Dict]:
    try:
        node_id = annotations["workflows.argoproj.io/node-id"]
        node_name = annotations["workflows.argoproj.io/node-name"]

        match = re.fullmatch(r"([\w\-]+)\[(\d+)\]\.([\w\-]+)", node_name)
        if not match:
            return None

        return {
            "status": "PROGRESSING",
            "node_id": node_id,
            "workflow_name": match.group(1),
            "current_step_number": int(match.group(2)),
            "current_step_name": match.group(3),
        }
    except KeyError:
        return None


def main(namespace: str) -> None:
    config.load_kube_config()
    v1 = client.CoreV1Api()
    w = watch.Watch()

    for event in w.stream(v1.list_namespaced_pod, namespace):
        if event["type"] == "ADDED" and event["object"].metadata.annotations:
            message_event = _parse_annotations(event["object"].metadata.annotations)
            if message_event:
                print(str(message_event))

        # print(
        #     "Event: %s %s %s %s"
        #     % (
        #         event["type"],
        #         event["object"].kind,
        #         event["object"].metadata.name,
        #         event["object"].metadata.annotations,
        #     )
        # )
        # print(str(event))
