from sagemaker import image_uris
import tensorflow as tf

tf_container = image_uris.retrieve(
    framework='tensorflow',
    region='us-east-1',
    version='2.18',
    instance_type='ml.c5.2xlarge',
    image_scope='inference'
)