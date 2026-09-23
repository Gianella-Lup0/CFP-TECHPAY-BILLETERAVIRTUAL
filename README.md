# TechPay: de la maqueta a la billetera virtual

TechPay es una billetera virtual bimonetaria creada como proyecto educativo de Diseño y Desarrollo Web.

La propuesta parte de una maqueta completa realizada con HTML y CSS. Después, JavaScript Vanilla incorpora el comportamiento de la aplicación paso a paso.

## Objetivo

El objetivo no es copiar una aplicación completa, sino aprender a transformar una interfaz estática en una aplicación interactiva mediante:

- Manipulación del DOM.
- Eventos del navegador.
- Objetos y arrays.
- Gestión de estado.
- Validaciones.
- Renderizado dinámico.
- `localStorage`.
- `fetch` y `async/await`.

## Las tres partes del proyecto

```text
HTML (index.html)  -> estructura y contenido
CSS (styles.css)   -> diseño y maquetación
JS (app.js)        -> interactividad y comportamiento
```

El proyecto utiliza un único archivo JavaScript. Ese archivo contiene comentarios pedagógicos para que los alumnos puedan inspeccionar el código y relacionar cada función con la interfaz.

## Reglas de maquetación

- Grid para el layout general.
- Flexbox dentro de los componentes.
- Colores escritos directamente, sin variables CSS.
- Medidas expresadas en `px` y `%`.
- Diseño responsive mediante media queries.
- JavaScript Vanilla, sin librerías.

## Estructura

```text
billetera-virtual/
├── index.html
├── styles.css
├── app.js
├── README.md
├── .gitignore
└── assets/
    └── images/
```

## Funcionalidades

### Saldo y privacidad

- Mostrar y ocultar el saldo.
- Mostrar saldos en pesos y dólares.
- Copiar el alias.
- Mostrar una notificación después de copiar.

### Contactos y operaciones

- Seleccionar contactos frecuentes.
- Agregar contactos nuevos.
- Registrar ingresos.
- Realizar transferencias.
- Validar que exista saldo suficiente.

### Servicios e historial

- Mostrar servicios pendientes.
- Pagar servicios.
- Filtrar movimientos.
- Buscar por descripción.
- Abrir comprobantes.

### Cotización del dólar

- Consultar una API pública mediante `fetch`.
- Mostrar un estado de carga.
- Comprar dólares con saldo en pesos.
- Calcular conversiones entre ARS y USD.
- Utilizar una cotización alternativa si la API falla.

## Persistencia

Los datos se guardan en `localStorage` para simular una base de datos local. Las claves utilizadas son:

- `techpay_saldo_ars`
- `techpay_saldo_usd`
- `techpay_transacciones`
- `techpay_contactos`
- `techpay_servicios`

La información es ficticia y tiene únicamente fines educativos. La aplicación no procesa dinero real ni debe utilizarse para guardar información financiera verdadera.

## Cómo trabajar con los prompts

Antes de usar cada prompt, compartan con la IA el contenido actualizado de `index.html`, `styles.css` y `app.js` cuando sea necesario.

No soliciten toda la aplicación de una sola vez. Copien un prompt, revisen la respuesta, prueben la funcionalidad y recién después continúen con la siguiente etapa.

Todos los prompts deben respetar estas reglas:

- Usar JavaScript Vanilla, sin librerías.
- Trabajar únicamente en `app.js`, salvo que se solicite expresamente otra cosa.
- Conservar el HTML y el CSS existentes.
- No borrar funcionalidades que ya funcionan.
- Agregar comentarios pedagógicos claros.
- Explicar primero qué elementos del DOM se utilizarán.
- Mostrar después solamente los cambios necesarios.

## Etapa 1: leer la maqueta

Antes de programar, hay que reconocer la relación entre la maqueta y JavaScript.

### Prompt

```text
Tengo una billetera virtual llamada TechPay maquetada con HTML y CSS.

Quiero que analices mi index.html y styles.css como docente de JavaScript inicial.

Identificá:
1. La tarjeta principal del saldo.
2. El botón para ocultar y mostrar el saldo.
3. El botón para copiar el alias.
4. Las tarjetas de operaciones.
5. El formulario y el modal de operaciones.
6. Los contactos.
7. La lista de movimientos.
8. Los filtros y el buscador.
9. Los servicios pendientes.
10. El modal de comprobante.

No escribas funcionalidades todavía y no modifiques ningún archivo.
Devolveme una tabla con el selector HTML, el elemento que representa y la funcionalidad que utilizará ese selector más adelante.
```

### Comprobar

- La maqueta se entiende antes de programar.
- Los selectores existen realmente en `index.html`.
- La página se ve correctamente en una pantalla grande y en una pantalla pequeña.

## Etapa 2: privacidad del saldo

El botón del ojo debe ocultar y mostrar los importes de la tarjeta principal.

### Prompt

```text
Quiero agregar la primera funcionalidad de TechPay usando JavaScript Vanilla.

Cuando se haga clic en #toggle-balance:
1. El importe de #balance-title debe cambiar por "$ ••••••••".
2. El texto de #balance-usd debe ocultarse con puntos.
3. El ícono y el aria-label del botón deben indicar que ahora se puede mostrar el saldo.
4. Si se vuelve a presionar, deben aparecer nuevamente los importes originales.

Usá addEventListener, una variable booleana, textContent y setAttribute.
Agregá comentarios pedagógicos que expliquen el estado visible u oculto.
No modifiques index.html ni styles.css y no implementes otras funcionalidades.
```

### Comprobar

- El saldo se oculta al presionar una vez.
- El saldo vuelve a aparecer al presionar nuevamente.
- La información de accesibilidad cambia correctamente.

## Etapa 3: copiar alias y mostrar notificaciones

El alias se copia con la Clipboard API y se informa el resultado mediante `#toast`.

### Prompt

```text
Mejorá la funcionalidad existente de TechPay.

Cuando se haga clic en #copy-alias:
1. Leé el valor de data-copy-value.
2. Copialo utilizando navigator.clipboard.writeText().
3. Mostrá "¡Alias copiado!" dentro de #toast.
4. Agregá la clase .is-visible al toast.
5. Quitá esa clase después de 1800 milisegundos usando setTimeout.
6. Si la copia falla, mostrale al usuario un mensaje de error.

Creá una función showToast reutilizable y explicá async, await y setTimeout con comentarios.
Conservá la funcionalidad de ocultar y mostrar el saldo.
No modifiques el HTML ni el CSS.
```

### Comprobar

- El alias se copia en el navegador.
- Aparece una notificación.
- La notificación desaparece automáticamente.
- La aplicación no se rompe si el navegador rechaza el acceso al portapapeles.

## Etapa 4: abrir operaciones

Las tres tarjetas deben abrir el mismo modal reutilizable con información diferente.

### Prompt

```text
Quiero conectar las tarjetas de operaciones de TechPay con el modal existente.

Para cada elemento [data-operation], escuchá el evento click.

Al hacer clic:
1. Si data-operation vale "income", mostrale "Ingresar dinero" a #modal-title.
2. Si vale "transfer", mostrale "Transferir dinero".
3. Si vale "currency", mostrale "Comprar dólares".
4. Guardá la operación actual en el dataset del modal.
5. Quitá .is-hidden de #operation-modal.

El botón #close-modal y un clic sobre el fondo deben cerrar el modal.
Todavía no modifiques saldos ni confirmes operaciones.
Usá una sola función reutilizable y agregá comentarios pedagógicos.
```

### Comprobar

- Cada tarjeta abre el modal.
- El título cambia según la tarjeta.
- El modal se puede cerrar desde el botón y desde el fondo.

## Etapa 5: ingresos y transferencias

El formulario comienza a modificar el estado de la billetera y el historial.

### Prompt

```text
Quiero implementar ingresos y transferencias en mi TechPay.

Creá un objeto wallet con balanceARS y transactions.

Al enviar #operation-form:
1. Leé el monto de #operation-amount y convertí el texto a número.
2. Rechazá montos vacíos, cero o negativos.
3. Si la operación es "income", aumentá wallet.balanceARS.
4. Si la operación es "transfer", exigí una descripción o alias.
5. En una transferencia, rechazá el importe si supera wallet.balanceARS.
6. Creá un movimiento dinámico dentro de #movements-list.
7. Actualizá #balance-title y mostrale una notificación.

Usá createElement y textContent para crear los movimientos.
No uses innerHTML con datos que provengan del formulario.
Conservá el resto de las funcionalidades y agregá comentarios pedagógicos sobre objetos, arrays, Number y validaciones.
```

### Comprobar

- Un ingreso aumenta el saldo.
- Una transferencia válida disminuye el saldo.
- Una transferencia superior al saldo es rechazada.
- Cada operación aparece en el historial.

## Etapa 6: contactos

Los contactos frecuentes deben reutilizar el formulario de transferencia y permitir agregar nuevos contactos.

### Prompt

```text
Quiero agregar gestión de contactos a TechPay.

Usá el contenedor #contacts-list y los elementos data-contact-id, data-contact-name y data-contact-alias.

Necesito que:
1. Al elegir un contacto, se abra el modal de transferencia.
2. El alias se copie en #operation-detail.
3. El botón #add-contact abra el modal de contacto.
4. El formulario #contact-form valide nombre y alias.
5. No se permita guardar un alias repetido.
6. El contacto nuevo aparezca en el carrusel.

Como los contactos pueden crearse después de cargar la página, usá delegación de eventos sobre #contacts-list.
Usá textContent para los datos ingresados por el usuario.
No borres las funcionalidades existentes y agregá comentarios pedagógicos.
```

### Comprobar

- Los contactos existentes completan el alias.
- Se puede agregar un contacto nuevo.
- No se permiten datos vacíos.
- No se permiten alias repetidos.

## Etapa 7: pago de servicios

Pagar un servicio debe ser una operación equivalente a una transferencia.

### Prompt

```text
Quiero implementar el pago de servicios en TechPay.

Cada servicio está dentro de .service-item y tiene data-service-id y data-service-amount.
Los botones de pago tienen la clase .pay-service.

Al presionar Pagar:
1. Identificá el servicio seleccionado.
2. Convertí data-service-amount a número.
3. Validá que wallet.balanceARS sea suficiente.
4. Descontá el importe del saldo.
5. Cambiá el servicio a estado pagado.
6. Deshabilitá su botón.
7. Actualizá #pending-services-count.
8. Agregá un egreso al historial.

Usá delegación de eventos sobre #services-list.
No modifiques la estructura visual existente y explicá las validaciones con comentarios pedagógicos.
```

### Comprobar

- Un servicio pagado cambia visualmente de estado.
- El saldo se actualiza.
- El contador disminuye.
- No se puede pagar dos veces el mismo servicio.

## Etapa 8: persistencia

La información debe mantenerse después de recargar la página.

### Prompt

```text
Quiero guardar el estado de TechPay en localStorage.

Guardá estas propiedades con estas claves:
- wallet.balanceARS en techpay_saldo_ars
- wallet.balanceUSD en techpay_saldo_usd
- wallet.transactions en techpay_transacciones
- wallet.contacts en techpay_contactos
- wallet.services en techpay_servicios

Creá funciones loadWallet y saveWallet.

Necesito que:
1. La aplicación cargue los valores guardados al comenzar.
2. Guarde los cambios después de ingresos, transferencias, contactos y pagos.
3. Use JSON.stringify para guardar arrays.
4. Use JSON.parse para recuperarlos.
5. Si no hay datos, use los valores iniciales.
6. Si los datos están dañados, no se rompa la aplicación.

No borres funcionalidades existentes. Explicá JSON.stringify, JSON.parse y try/catch con comentarios pedagógicos.
```

### Comprobar

- Crear una operación.
- Recargar la página.
- Comprobar que saldo e historial continúen.
- Crear un contacto y verificar que continúe.
- Pagar un servicio y verificar su estado.

## Etapa 9: filtros y búsqueda

Las pestañas y el buscador deben funcionar al mismo tiempo.

### Prompt

```text
Quiero agregar filtros y búsqueda al historial de TechPay.

Las pestañas tienen data-filter con los valores all, income, expense y currency.
El campo de búsqueda es #movement-search.
Cada movimiento tiene data-type y data-description.

Creá una función filterMovements que:
1. Guarde el filtro seleccionado.
2. Escuche el evento input del buscador.
3. Compare el texto sin distinguir mayúsculas y minúsculas.
4. Muestre solamente los movimientos que coincidan con ambas condiciones.
5. Actualice .is-active y aria-selected en las pestañas.
6. Muestre #no-movements cuando no haya coincidencias.

Usá filter o un recorrido equivalente sobre los elementos del DOM.
Conservá todas las funcionalidades anteriores y agregá comentarios pedagógicos.
```

### Comprobar

- Filtrar ingresos.
- Filtrar egresos.
- Buscar una descripción existente.
- Combinar búsqueda y filtro.
- Buscar un texto inexistente.

## Etapa 10: comprobantes

Cada movimiento debe abrir un comprobante con sus datos principales.

### Prompt

```text
Quiero agregar comprobantes al historial de TechPay.

Cuando se haga clic en un .movement-item:
1. Abrí #receipt-modal.
2. Mostrá el texto de .movement-amount en #receipt-amount.
3. Mostrá data-description en #receipt-description.
4. Mostrá un identificador único en #receipt-id.
5. Mostrá el estado Completado.

Usá delegación de eventos sobre #movements-list porque algunos movimientos se crean dinámicamente.
El botón #close-receipt-modal y un clic sobre el fondo deben cerrar el modal.
No uses datos inventados distintos del movimiento seleccionado y agregá comentarios pedagógicos.
```

### Comprobar

- Abrir un movimiento inicial.
- Abrir un movimiento creado por el usuario.
- Verificar que el importe y la descripción coincidan.
- Cerrar el comprobante de ambas formas.

## Etapa 11: cotización y compra de dólares

La aplicación consulta una cotización externa y utiliza un valor de referencia si no hay conexión.

### Prompt

```text
Quiero incorporar la cotización del dólar y la compra de dólares en TechPay.

Consultá https://dolarapi.com/v1/dolares/oficial usando fetch y async/await.

Necesito que:
1. #exchange-status muestre "Actualizando..." mientras espera.
2. #dollar-buy muestre data.compra.
3. #dollar-sell muestre data.venta.
4. Si fetch falla, se mantengan valores de referencia y se informe ese estado.
5. Al abrir data-operation="currency", se explique cuántos dólares recibirá la persona.
6. El cálculo use la cotización de venta.
7. Se valide saldo suficiente en ARS.
8. Se descuenten ARS y se sumen USD.
9. Se agregue un movimiento de tipo currency.
10. Se guarde el nuevo saldo.

Explicá fetch, response.ok, response.json, async/await y el fallback con comentarios pedagógicos.
No modifiques el CSS ni borres las funcionalidades anteriores.
```

### Comprobar

- Ver el estado de carga.
- Ver la cotización recibida.
- Escribir un importe y observar la conversión.
- Comprar dólares con saldo suficiente.
- Intentar comprar más dólares que el saldo disponible.
- Probar sin conexión y comprobar el valor de referencia.

## Pruebas finales

1. Ocultar y mostrar el saldo.
2. Copiar el alias.
3. Abrir y cerrar cada operación.
4. Registrar un ingreso.
5. Transferir un importe válido.
6. Intentar transferir más dinero que el saldo.
7. Agregar un contacto.
8. Intentar repetir un alias.
9. Pagar un servicio.
10. Intentar pagar sin saldo suficiente.
11. Filtrar ingresos y egresos.
12. Buscar un movimiento existente.
13. Abrir un comprobante.
14. Comprar dólares.
15. Recargar la página y comprobar la persistencia.
16. Probar la aplicación sin conexión.
17. Revisar que no haya errores en la consola.

## Servidor local

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Después abrir `http://localhost:8000` en el navegador.
