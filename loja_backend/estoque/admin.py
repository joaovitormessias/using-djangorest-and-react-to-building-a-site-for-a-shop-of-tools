from django.contrib import admin

from .models import Categoria, Ferramenta


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    """Configura a exibicao basica das categorias no painel."""

    list_display = ("nome", "destaque")
    list_filter = ("destaque",)
    search_fields = ("nome",)


@admin.register(Ferramenta)
class FerramentaAdmin(admin.ModelAdmin):
    """Permite controlar as ferramentas no painel administrativo."""

    list_display = ("nome", "marca", "categoria", "preco", "estoque", "em_promocao")
    list_filter = ("categoria", "em_promocao")
    search_fields = ("nome", "marca")
    autocomplete_fields = ("categoria",)
