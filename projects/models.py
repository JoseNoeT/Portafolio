from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify


def validate_image_size(image):
    """Validate that image does not exceed 5 MB."""
    max_size = 5 * 1024 * 1024
    if image and hasattr(image, 'size') and image.size > max_size:
        raise ValidationError("Image must not exceed 5MB.")


class Project(models.Model):

    CATEGORY_CHOICES = [
        ("professional", "Professional"),
        ("academic", "Academic"),
        ("personal", "Personal"),
        ("engineering", "Engineering"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)

    short_description = models.CharField(max_length=300)
    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="personal"
    )

    technologies = models.CharField(
        max_length=255,
        help_text="Comma separated values (e.g. Django, React, PostgreSQL)",
        blank=True
    )

    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)

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

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title