from django import forms
from .models import Project
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import validate_image_size


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleFileField(forms.FileField):
    widget = MultipleFileInput

    def clean(self, data, initial=None):
        single_clean = super().clean
        if not data:
            return []
        if isinstance(data, (list, tuple)):
            return [single_clean(item, initial) for item in data]
        return [single_clean(data, initial)]


class ProjectForm(forms.ModelForm):
    gallery_images = MultipleFileField(
        required=False,
        label='Galería del proyecto',
        help_text='Agrega una o varias imágenes para mostrar distintas pantallas, funcionalidades o características del proyecto.',
    )

    class Meta:
        model = Project
        fields = [
            'title',
            'short_description',
            'description',
            'category',
            'technologies',
            'github_url',
            'live_url',
            'demo_video_url',
            'image',
        ]
        labels = {
            'title': 'Título',
            'short_description': 'Descripción corta',
            'description': 'Descripción completa',
            'category': 'Categoría',
            'technologies': 'Tecnologías',
            'github_url': 'URL de GitHub',
            'live_url': 'URL del demo',
            'demo_video_url': 'Video demostrativo',
            'image': 'Imagen principal',
        }
        help_texts = {
            'technologies': 'Tecnologías separadas por coma (ej: Django, React, PostgreSQL).',
            'image': 'Esta imagen se utilizará como portada del proyecto en el listado y en la cabecera del detalle.',
            'github_url': 'Enlace opcional al repositorio del proyecto.',
            'live_url': 'Enlace opcional a la demo en línea.',
            'demo_video_url': 'Admite enlaces de YouTube, Vimeo o Loom para mostrar el funcionamiento del proyecto.',
        }
        widgets = {
            'description': forms.Textarea(attrs={'rows': 6}),
            'short_description': forms.TextInput(attrs={'placeholder': 'Breve descripción del proyecto'}),
            'technologies': forms.TextInput(attrs={'placeholder': 'Django, React, PostgreSQL'}),
        }
    def clean_image(self):
        image = self.cleaned_data.get('image')
        if not image:
            return image

        self._validate_supported_image(image)

        return image

    def clean_gallery_images(self):
        images = self.files.getlist('gallery_images')
        for image in images:
            self._validate_supported_image(image)

        return images

    def _validate_supported_image(self, image):
        if not image:
            return image

        # Delegate to model field validators to keep single source of truth
        # Explicit minimal checks: extension and size
        name = getattr(image, 'name', '')
        if '.' not in name:
            raise forms.ValidationError('Formato de imagen no permitido. Use jpg, jpeg, png o gif.')
        ext = name.rsplit('.', 1)[1].lower()
        if ext not in ('jpg', 'jpeg', 'png', 'gif'):
            raise forms.ValidationError('Formato de imagen no permitido. Use jpg, jpeg, png o gif.')

        try:
            validate_image_size(image)
        except DjangoValidationError as e:
            raise forms.ValidationError(e.messages)

        return image
    
    
