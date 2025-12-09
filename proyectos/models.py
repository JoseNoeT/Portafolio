from django.db import models

class Project(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField()
	url = models.URLField(blank=True)
	image = models.ImageField(upload_to="projects/", blank=True)
    
	def __str__(self):
		return self.title
