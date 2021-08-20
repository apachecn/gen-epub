#!/usr/bin/env python3.7
# -*- coding: utf-8 -*-

import setuptools
import GenEpub

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    install_requires = fh.read().splitlines()

setuptools.setup(
    name="GenEpub",
    version=GenEpub.__version__,
    url="https://github.com/apachecn/gen-epub",
    author=GenEpub.__author__,
    author_email=GenEpub.__email__,
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "License :: Other/Proprietary License",
        "Natural Language :: Chinese (Simplified)",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Topic :: Text Processing :: Markup :: HTML",
        "Topic :: Utilities",
    ],
    description="GenEpub，用于生成 EPUB 的小工具",
    long_description=long_description,
    long_description_content_type="text/markdown",
    keywords=[
        "epub",
        "ebook",
        "电子书",
    ],
    install_requires=install_requires,
    python_requires=">=3.6",
    packages=setuptools.find_packages(),
    package_data={'': ['*']},
)
