# Imagen de PHP 8.2 con Apache y la extensión para MySQL
FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql
COPY . /var/www/html/
