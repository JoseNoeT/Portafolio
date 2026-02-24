from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError


def validate_image_size(image):
	"""Valida que la imagen no supere 5 MB."""
	max_size = 5 * 1024 * 1024
	if image and hasattr(image, 'size') and image.size > max_size:
		raise ValidationError(f"La imagen no debe superar {max_size // (1024*1024)} MB.")


class Project(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField()
	url = models.URLField(blank=True)
	image = models.ImageField(
		upload_to="projects/",
		blank=True,
		validators=[
			FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']),
			validate_image_size,
		],
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.title
