from django import forms
from .models import Project


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
        widgets = {
            'description': forms.Textarea(attrs={'rows': 6}),
            'short_description': forms.TextInput(attrs={'placeholder': 'Breve descripción del proyecto'}),
            'technologies': forms.TextInput(attrs={'placeholder': 'Django, React, PostgreSQL'}),
        }
