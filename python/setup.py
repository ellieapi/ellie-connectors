#!/usr/bin/env python

from distutils.core import setup

setup(name='ellie',
      version='1.1.0',
      description='Ellie API database connectors',
      author='Ellie Technologies',
      url='https://www.ellie.ai/',
      packages=['ellie'],
      install_requires=[
        'snowflake-connector-python>=3.0.3',
        'requests>=2.31.0',
        'psycopg2-binary>=2.9.6',
      ]
)
