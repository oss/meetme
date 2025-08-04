FROM registry.redhat.io/rhel9/python-312
EXPOSE 8000
RUN pip install mkdocs mkdocs-material
WORKDIR /root
COPY . .
RUN mkdocs build
ENTRYPOINT [ "mkdocs" ]
CMD [ "build" ]
