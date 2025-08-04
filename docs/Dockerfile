FROM python
EXPOSE 8000
RUN pip install mkdocs mkdocs-material
WORKDIR /root
COPY . .
RUN mkdocs build
ENTRYPOINT [ "mkdocs" ]
CMD [ "build" ]
