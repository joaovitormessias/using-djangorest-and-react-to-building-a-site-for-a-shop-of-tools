from django.db import models


class Categoria(models.Model):
    """Guarda o conjunto de categorias utilizadas na vitrine."""

    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    destaque = models.BooleanField(default=False)

    class Meta:
        ordering = ["nome"]
        verbose_name = "categoria"
        verbose_name_plural = "categorias"

    def __str__(self) -> str:
        return self.nome


class Ferramenta(models.Model):
    """Define cada ferramenta individual com seus detalhes."""

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name="ferramentas",
    )
    nome = models.CharField(max_length=120)
    marca = models.CharField(max_length=80)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    estoque = models.PositiveIntegerField(default=0)
    descricao = models.TextField(blank=True)
    em_promocao = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]
        verbose_name = "ferramenta"
        verbose_name_plural = "ferramentas"

    def __str__(self) -> str:
        return f"{self.nome} ({self.marca})"
