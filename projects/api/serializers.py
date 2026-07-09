from rest_framework import serializers

from projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    tech_list = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'category',
            'technologies',
            'tech_list',
            'github_url',
            'live_url',
            'image_url',
            'created_at',
            'updated_at',
        ]

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request')
        image_url = obj.image.url
        if request is not None:
            return request.build_absolute_uri(image_url)
        return image_url
