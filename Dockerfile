FROM denoland/deno:2.4.5
COPY . .
RUN deno install
RUN ./setup.sh

CMD ["deno", "task", "start"]