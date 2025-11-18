from rest_framework import filters, viewsets

from .models import Categoria, Ferramenta
from .permissions import PermissaoPorAcao
from .serializers import CategoriaSerializer, FerramentaSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    """Exibe e administra as categorias cadastradas."""

    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [PermissaoPorAcao]
    permissao_app = "estoque"
    permissao_modelo = "categoria"
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome"]


class FerramentaViewSet(viewsets.ModelViewSet):
    """CRUD completo das ferramentas expostas no catalogo."""

    queryset = Ferramenta.objects.select_related("categoria").all()
    serializer_class = FerramentaSerializer
    permission_classes = [PermissaoPorAcao]
    permissao_app = "estoque"
    permissao_modelo = "ferramenta"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "marca", "categoria__nome"]
    ordering_fields = ["preco", "nome", "estoque"]
    ordering = ["nome"]
