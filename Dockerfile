FROM nginx:latest

ENV GLOBE_URL=globe.airplanes.live
ENV SITE_URL=airplanes.live

WORKDIR /usr/share/nginx/html

COPY html .
COPY nginx.conf /etc/nginx/templates/default.conf.template
RUN chown -R nginx:nginx /usr/share/nginx/html/
