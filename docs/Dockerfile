FROM quay.io/sclorg/python-312-minimal-c9s
EXPOSE 8000
RUN pip install mkdocs mkdocs-material
WORKDIR /root
COPY --exclude "test" . .
RUN mkdocs build
ENTRYPOINT [ "mkdocs" ]
CMD [ "build" ]
