from django import forms

from .models import SiteSettings


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = [
            'site_name',
            'professional_title',
            'contact_email',
            'contact_phone',
            'whatsapp_number',
            'github_url',
            'linkedin_url',
            'footer_text',
            'is_active',
        ]
        labels = {
            'site_name': 'Nombre del sitio',
            'professional_title': 'Título profesional',
            'contact_email': 'Email de contacto',
            'contact_phone': 'Teléfono visible',
            'whatsapp_number': 'WhatsApp',
            'github_url': 'GitHub',
            'linkedin_url': 'LinkedIn',
            'footer_text': 'Texto del footer',
            'is_active': 'Sitio activo',
        }
        widgets = {
            'site_name': forms.TextInput(attrs={'placeholder': 'Ej: Jose Noe'}),
            'professional_title': forms.TextInput(attrs={'placeholder': 'Ej: Backend Engineer'}),
            'contact_email': forms.EmailInput(attrs={'placeholder': 'Ej: jmnt2012@gmail.com'}),
            'contact_phone': forms.TextInput(attrs={'placeholder': 'Ej: +56 9 30387145'}),
            'whatsapp_number': forms.TextInput(attrs={'placeholder': 'Ej: +56930387145'}),
            'github_url': forms.URLInput(attrs={'placeholder': 'https://github.com/usuario'}),
            'linkedin_url': forms.URLInput(attrs={'placeholder': 'https://linkedin.com/in/usuario'}),
            'footer_text': forms.TextInput(attrs={'placeholder': 'Ej: Backend Developer'}),
        }


class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'placeholder': 'tu@correo.com', 'class': 'form-input'}))
    subject = forms.CharField(max_length=150, required=True, widget=forms.TextInput(attrs={'placeholder': 'Asunto', 'class': 'form-input'}))
    message = forms.CharField(
        required=True,
        min_length=20,
        max_length=2000,
        widget=forms.Textarea(attrs={"rows": 6, 'placeholder': 'Escribe tu mensaje aquí...', 'class': 'form-textarea'}),
    )
    honeypot = forms.CharField(required=False, widget=forms.HiddenInput)

    def clean_honeypot(self):
        value = self.cleaned_data.get("honeypot", "")
        if value.strip():
            raise forms.ValidationError("Invalid submission.")
        return value
