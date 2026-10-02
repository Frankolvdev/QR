# Google Places - configuración

Este proyecto usa Places API (New) desde el servidor para buscar negocios y obtener el enlace oficial `googleMapsLinks.writeAReviewUri`.

Variable requerida en `.env`:

GOOGLE_MAPS_API_KEY="TU_API_KEY"

En Google Cloud, habilita **Places API (New)** para el proyecto de esa clave. Para producción, como la clave se usa desde el servidor y no se expone al navegador, restringe la clave a Places API (New) y, si tu infraestructura lo permite, a la IP pública del servidor.

Después de modificar `.env`, reinicia el proceso de la aplicación.
