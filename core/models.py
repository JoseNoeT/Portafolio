from django.db import models


class SiteSettings(models.Model):
	site_name = models.CharField(max_length=120, default='Jose Noe')
	professional_title = models.CharField(max_length=180, blank=True, default='Backend Engineer')
	contact_email = models.EmailField(blank=True, default='jmnt2012@gmail.com')
	contact_phone = models.CharField(max_length=30, blank=True, default='+56 9 30387145')
	whatsapp_number = models.CharField(max_length=30, blank=True, default='+56930387145')
	github_url = models.URLField(blank=True)
	linkedin_url = models.URLField(blank=True)
	footer_text = models.CharField(max_length=255, blank=True, default='Backend Developer')
	is_active = models.BooleanField(default=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Site settings'
		verbose_name_plural = 'Site settings'

	def save(self, *args, **kwargs):
		# Keep one canonical row so templates can read a single settings object.
		self.pk = 1
		super().save(*args, **kwargs)

	@classmethod
	def get_solo(cls):
		obj, _ = cls.objects.get_or_create(
			pk=1,
			defaults={
				'site_name': 'Jose Noe',
				'professional_title': 'Backend Engineer',
				'contact_email': 'jmnt2012@gmail.com',
				'contact_phone': '+56 9 30387145',
				'whatsapp_number': '+56930387145',
				'footer_text': 'Backend Developer',
				'is_active': True,
			},
		)
		return obj

	def __str__(self):
		return self.site_name


class ContactMessage(models.Model):
	SOURCE_CHOICES = [
		('contact_form', 'Contact form'),
		('other', 'Other'),
	]

	name = models.CharField(max_length=100)
	email = models.EmailField()
	subject = models.CharField(max_length=150)
	message = models.TextField(max_length=2000)
	created_at = models.DateTimeField(auto_now_add=True)
	is_read = models.BooleanField(default=False)
	is_replied = models.BooleanField(default=False)
	source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='contact_form')

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.subject} - {self.email}'
