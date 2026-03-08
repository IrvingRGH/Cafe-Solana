console.log("Iniciando pruebas del contrato Cafe-Solana...\n");

// 1. Definir el ID del café (u64 en Rust → BN en TypeScript)
const idCafe = new anchor.BN(1);

// 2. Derivar la dirección PDA del café usando las semillas definidas en el programa
const [cafePda] = anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("cafe"),
    pg.wallet.publicKey.toBuffer(),
    idCafe.toArrayLike(Buffer, "le", 8), // 8 bytes en formato little-endian para u64
  ],
  pg.program.programId
);

console.log("📍 PDA derivada para el café:", cafePda.toBase58());

(async () => {
  // ==========================================
  // CREATE: Registrar un café
  // ==========================================
  try {
    console.log("\n--- 1. CREANDO REGISTRO DE CAFÉ ---");
    const txCreate = await pg.program.methods
      .registrarCafe(idCafe, "Café Chiapaneco Premium", "Chiapas", "Especialidad")
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("✅ Transacción de creación exitosa. Hash:", txCreate);
  } catch (e) {
    console.error("❌ Error al crear:", e.message);
  }

  // ==========================================
  // READ: Leer los datos del café desde la blockchain
  // ==========================================
  try {
    console.log("\n--- 2. LEYENDO DATOS DEL CAFÉ ---");
    const cafeData = await pg.program.account.cafe.fetch(cafePda);

    console.log("☕ Datos extraídos de la PDA:");
    console.log("   - Productor:", cafeData.productor.toBase58());
    console.log("   - ID del Café:", cafeData.idCafe.toString());
    console.log("   - Marca:", cafeData.marca);
    console.log("   - Región de origen:", cafeData.region);
    console.log("   - Calidad:", cafeData.calidad);
    console.log("   - Estado actual:", cafeData.estado);
  } catch (e) {
    console.error("❌ Error al leer:", e.message);
  }

  // ==========================================
  // UPDATE: Cambiar el estado del café
  // ==========================================
  try {
    console.log("\n--- 3. ACTUALIZANDO ESTADO DEL CAFÉ ---");
    const txUpdate = await pg.program.methods
      .actualizarEstado(idCafe, "Tostado y Exportado")
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
      })
      .rpc();
    console.log("✅ Transacción de actualización exitosa. Hash:", txUpdate);

    // Verificar el cambio
    const cafeActualizado = await pg.program.account.cafe.fetch(cafePda);
    console.log(
      "🔄 Nuevo estado verificado en la blockchain:",
      cafeActualizado.estado
    );
  } catch (e) {
    console.error("❌ Error al actualizar:", e.message);
  }

  // ==========================================
  // DELETE: Eliminar el registro del café
  // ==========================================
  try {
    console.log("\n--- 4. ELIMINANDO REGISTRO DEL CAFÉ ---");
    const txDelete = await pg.program.methods
      .eliminarCafe(idCafe)
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
      })
      .rpc();
    console.log(
      "✅ Transacción de eliminación exitosa. Hash:",
      txDelete
    );
    console.log(
      "💰 La cuenta fue cerrada y los tokens SOL de 'rent' han vuelto a tu wallet."
    );
  } catch (e) {
    console.error("❌ Error al eliminar:", e.message);
  }

  console.log("\n☕ ¡Prueba del CRUD de Cafe-Solana completada con éxito!");
})();
