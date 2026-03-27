FROM denoland/deno:2.6.8
# RUN mkdir -p .git/hooks
COPY . .
RUN deno install
# RUN ./setup.sh

CMD ["deno", "task", "start"]