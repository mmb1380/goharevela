"""URL configuration for the cms app's JSON API."""
from django.urls import path

from . import views

app_name = 'cms'

urlpatterns = [
    path('config/', views.site_config, name='site-config'),
]
