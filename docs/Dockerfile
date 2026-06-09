FROM python
EXPOSE 8000
RUN pip install mkdocs mkdocs-material
WORKDIR /root
COPY . .
RUN mkdocs build
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000" ]
