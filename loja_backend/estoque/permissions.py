from rest_framework import permissions


class PermissaoPorAcao(permissions.BasePermission):
    """Trata os grupos de leitura, edicao e exclusao."""

    permissoes_por_metodo = {
        "POST": "add",
        "PUT": "change",
        "PATCH": "change",
        "DELETE": "delete",
    }

    def has_permission(self, request, view):
        # Leituras ficam liberadas para qualquer pessoa
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        app_label = getattr(view, "permissao_app", getattr(view.queryset.model._meta, "app_label", ""))
        modelo = getattr(view, "permissao_modelo", getattr(view.queryset.model._meta, "model_name", ""))
        codigo = self.permissoes_por_metodo.get(request.method)

        # Quando nao existe codigo especifico apenas exige autenticacao
        if not codigo:
            return True

        perm = f"{app_label}.{codigo}_{modelo}"
        return request.user.has_perm(perm)
