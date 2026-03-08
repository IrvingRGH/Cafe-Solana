# ☕ Cafe-Solana - Registro de Cafés en la Blockchain

CRUD completo de un Solana Program desarrollado con **Rust** y **Anchor** desde el Solana Playground.

Permite registrar cafés con su marca, región de origen (Chiapas, Oaxaca, Veracruz, etc.), calidad (Especialidad, Premium, Gourmet) y rastrear su estado (En producción, Tostado, En venta, Exportado).

---

## ⚙️ Arquitectura Técnica

El programa implementa un patrón **CRUD completo (Create, Read, Update, Delete)** respaldado por **PDAs (Program Derived Addresses)** para el manejo seguro del estado en la blockchain.

### Estructura de Datos (Estado)

Cada café se almacena en su propia cuenta (PDA) con la siguiente estructura:

- `productor` (Pubkey): Billetera del productor/dueño del café.
- `id_cafe` (u64): Identificador numérico único del café.
- `marca` (String): Marca del café (ej. "Café Chiapaneco Premium").
- `region` (String): Región de origen (ej. "Chiapas", "Oaxaca", "Veracruz").
- `calidad` (String): Calidad del café (ej. "Especialidad", "Premium", "Gourmet", "Comercial").
- `estado` (String): Estado actual del café ("En producción", "Tostado", "En venta", "Exportado").

### Seguridad y PDAs

La dirección de cada cuenta se deriva de manera determinista usando las semillas:

`[b"cafe", productor.key().as_ref(), id_cafe.to_le_bytes().as_ref()]`

Esto asegura que:

1. Un productor puede registrar múltiples cafés sin colisión de cuentas (gracias al `id_cafe`).
2. Se usa la macro `has_one = productor` para garantizar que **solo el productor original** pueda modificar o eliminar el registro.

---

## 🚀 Guía de Ejecución en Solana Playground (SolPG)

### Paso 1: Importar el proyecto

1. Copia el enlace de tu repositorio.
2. Abre [Solana Playground](https://beta.solpg.io/) y pega el enlace con el formato:
   ```
   https://beta.solpg.io/github.com/TU_USUARIO/Cafe-Solana
   ```
3. Haz clic en **Import** y asigna un nombre al proyecto.

### Paso 2: Configurar Wallet y Red

1. En la parte inferior izquierda, haz clic en **Not Connected** para conectarte a la **Devnet**.
2. Se creará automáticamente una wallet de prueba.
3. Solicita tokens de prueba en la terminal:
   ```bash
   solana airdrop 2
   ```

### Paso 3: Construcción (Build)

1. Haz clic en el botón **Build** en el menú lateral (o escribe `anchor build` en la terminal).
2. Verifica que aparezca una marca verde indicando compilación exitosa.
   - _SolPG actualizará automáticamente el `declare_id!` con el ID de programa generado._

### Paso 4: Despliegue (Deploy)

1. Haz clic en **Deploy** (o escribe `anchor deploy` en la terminal).
2. Espera la confirmación: _Deploy successful_.

### Paso 5: Pruebas (Test CRUD)

Ejecuta el archivo `client/client.ts` con el comando:

```bash
run
```

El script ejecutará el ciclo completo:

- **CREATE**: Registra un café con marca, región y calidad.
- **READ**: Lee los datos del café desde la blockchain.
- **UPDATE**: Cambia el estado del café a "Tostado y Exportado".
- **DELETE**: Elimina la cuenta y recupera los SOL de renta.

### 📋 Salida Esperada en Consola

```
Iniciando pruebas del contrato Cafe-Solana...

📍 PDA derivada para el café: [Dirección PDA]

--- 1. CREANDO REGISTRO DE CAFÉ ---
✅ Transacción de creación exitosa. Hash: [Hash]

--- 2. LEYENDO DATOS DEL CAFÉ ---
☕ Datos extraídos de la PDA:
   - Productor: [Tu Wallet]
   - ID del Café: 1
   - Marca: Café Chiapaneco Premium
   - Región de origen: Chiapas
   - Calidad: Especialidad
   - Estado actual: En producción

--- 3. ACTUALIZANDO ESTADO DEL CAFÉ ---
✅ Transacción de actualización exitosa. Hash: [Hash]
🔄 Nuevo estado verificado en la blockchain: Tostado y Exportado

--- 4. ELIMINANDO REGISTRO DEL CAFÉ ---
✅ Transacción de eliminación exitosa. Hash: [Hash]
💰 La cuenta fue cerrada y los tokens SOL de 'rent' han vuelto a tu wallet.

☕ ¡Prueba del CRUD de Cafe-Solana completada con éxito!
```

---

## 🛠️ Tecnologías

- **Rust** - Lógica del Smart Contract.
- **Anchor Framework** - Simplificación del desarrollo y validación de cuentas.
- **TypeScript & Web3.js** - Integración y pruebas (Testing).
- **Solana Devnet** - Red de pruebas para despliegue.
