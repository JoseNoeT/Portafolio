from django import forms
from .models import Project
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import validate_image_size


class ProjectForm(forms.ModelForm):
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
            'image': 'Imagen',
        }
        help_texts = {
            'technologies': 'Tecnologías separadas por coma (ej: Django, React, PostgreSQL).',
            'image': 'Imagen opcional del proyecto (jpg, jpeg, png o gif, máximo 5MB).',
            'github_url': 'Enlace opcional al repositorio del proyecto.',
            'live_url': 'Enlace opcional a la demo en línea.',
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
    
    
