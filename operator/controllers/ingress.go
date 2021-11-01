package controllers

import (
	"context"

	appsv1 "k8s.io/api/apps/v1"
	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	intermineorgv1alpha1 "intermine_cloud/operator/api/v1alpha1"
)

// ensureIngress ensures Ingress is Running in a namespace.
func (r *IntermineInstanceReconciler) ensureIngress(request reconcile.Request,
	instance *intermineorgv1alpha1.IntermineInstance,
	ingress *networkingv1.Ingress,
) (*reconcile.Result, error) {

	// See if ingress already exists and create if it doesn't
	found := &appsv1.Deployment{}
	err := r.Get(context.TODO(), types.NamespacedName{
		Name:      ingress.Name,
		Namespace: instance.Namespace,
	}, found)
	if err != nil && errors.IsNotFound(err) {

		// Create the ingress
		err = r.Create(context.TODO(), ingress)

		if err != nil {
			// ingress creation failed
			return &reconcile.Result{}, err
		} else {
			// ingress creation was successful
			return nil, nil
		}
	} else if err != nil {
		// Error that isn't due to the ingress not existing
		return &reconcile.Result{}, err
	}

	return nil, nil
}

// backendIngress is a code for creating an Ingress
func (r *IntermineInstanceReconciler) backendIngress(v *intermineorgv1alpha1.IntermineInstance) *networkingv1.Ingress {
	// labels := labels(v, "backend")

	pathTypePrefix := networkingv1.PathTypePrefix // a workaround to get constant's address

	ingress := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "backend-ingress",
			Namespace: v.Namespace,
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{{
				IngressRuleValue: networkingv1.IngressRuleValue{
					HTTP: &networkingv1.HTTPIngressRuleValue{
						Paths: []networkingv1.HTTPIngressPath{{
							Path:     "/",
							PathType: &pathTypePrefix,
							Backend: networkingv1.IngressBackend{
								Service: &networkingv1.IngressServiceBackend{
									Name: "backend-service",
									Port: networkingv1.ServiceBackendPort{
										Number: 8080,
									},
								},
							},
						}},
					},
				},
			}},
		},
	}

	controllerutil.SetControllerReference(v, ingress, r.Scheme)
	return ingress
}
