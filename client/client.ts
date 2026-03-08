console.log("Ejecutando pruebas del contrato Cafe-Solana...\n");

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

console.log("Direccion PDA generada para el cafe:", cafePda.toBase58());

(async () => {
  // ==========================================
  // CREATE: Registrar un café
  // ==========================================
  try {
    console.log("\n--- PASO 1: REGISTRO DE UN NUEVO CAFE ---");
    const txCreate = await pg.program.methods
      .registrarCafe(idCafe, "Café Chiapaneco Premium", "Chiapas", "Especialidad")
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Registro exitoso. Hash de la transaccion:", txCreate);
  } catch (e) {
    console.error("Fallo al registrar el cafe:", e.message);
  }

  // ==========================================
  // READ: Leer los datos del café desde la blockchain
  // ==========================================
  try {
    console.log("\n--- PASO 2: LECTURA DE DATOS DEL CAFE ---");
    const cafeData = await pg.program.account.cafe.fetch(cafePda);

    console.log("Informacion obtenida de la cuenta PDA:");
    console.log("   Productor:", cafeData.productor.toBase58());
    console.log("   ID del cafe:", cafeData.idCafe.toString());
    console.log("   Marca:", cafeData.marca);
    console.log("   Region de origen:", cafeData.region);
    console.log("   Calidad:", cafeData.calidad);
    console.log("   Estado actual:", cafeData.estado);
  } catch (e) {
    console.error("Fallo al leer los datos:", e.message);
  }

  // ==========================================
  // UPDATE: Cambiar el estado del café
  // ==========================================
  try {
    console.log("\n--- PASO 3: ACTUALIZACION DEL ESTADO ---");
    const txUpdate = await pg.program.methods
      .actualizarEstado(idCafe, "Tostado y Exportado")
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
      })
      .rpc();
    console.log("Actualizacion exitosa. Hash de la transaccion:", txUpdate);

    // Verificar el cambio
    const cafeActualizado = await pg.program.account.cafe.fetch(cafePda);
    console.log(
      "Estado verificado en la blockchain:",
      cafeActualizado.estado
    );
  } catch (e) {
    console.error("Fallo al actualizar el estado:", e.message);
  }

  // ==========================================
  // DELETE: Eliminar el registro del café
  // ==========================================
  try {
    console.log("\n--- PASO 4: ELIMINACION DEL REGISTRO ---");
    const txDelete = await pg.program.methods
      .eliminarCafe(idCafe)
      .accounts({
        cafe: cafePda,
        productor: pg.wallet.publicKey,
      })
      .rpc();
    console.log(
      "Eliminacion exitosa. Hash de la transaccion:",
      txDelete
    );
    console.log(
      "La cuenta fue cerrada y los tokens SOL de renta han sido devueltos a tu wallet."
    );
  } catch (e) {
    console.error("Fallo al eliminar el registro:", e.message);
  }

  console.log("\nPrueba del CRUD de Cafe-Solana finalizada correctamente.");
})();
