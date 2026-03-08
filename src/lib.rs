use anchor_lang::prelude::*;

// SolPG generará automáticamente un ID cuando construyas (build) el proyecto.
declare_id!("");

#[program]
pub mod cafe_solana {
    use super::*;

    // ====================== 1. CREATE: Registrar un café ======================
    // Crea una PDA (Program Derived Address) para almacenar la información de un café.
    // Cada café tiene su propia cuenta en la blockchain, derivada del productor y un ID único.
    pub fn registrar_cafe(
        ctx: Context<RegistrarCafe>,
        id_cafe: u64,
        marca: String,
        region: String,
        calidad: String,
    ) -> Result<()> {
        let cafe = &mut ctx.accounts.cafe;
        cafe.productor = *ctx.accounts.productor.key;
        cafe.id_cafe = id_cafe;
        cafe.marca = marca;
        cafe.region = region;
        cafe.calidad = calidad;
        cafe.estado = String::from("En producción"); // Estado inicial por defecto

        msg!("Café registrado exitosamente con ID: {}", id_cafe);
        Ok(())
    }

    // ====================== 2. UPDATE: Actualizar el estado del café ======================
    // Permite cambiar el estado del café (ej. "Tostado", "En venta", "Exportado").
    pub fn actualizar_estado(
        ctx: Context<ActualizarCafe>,
        id_cafe: u64,
        nuevo_estado: String,
    ) -> Result<()> {
        let cafe = &mut ctx.accounts.cafe;
        cafe.estado = nuevo_estado;

        msg!(
            "El estado del café {} ha sido actualizado a: {}",
            id_cafe,
            cafe.estado
        );
        Ok(())
    }

    // ====================== 3. DELETE: Eliminar el registro del café ======================
    // Cierra la cuenta PDA y devuelve los SOL de renta al productor.
    // La macro `close = productor` en el contexto hace todo el trabajo de cierre.
    pub fn eliminar_cafe(
        _ctx: Context<EliminarCafe>,
        id_cafe: u64,
    ) -> Result<()> {
        msg!("El registro del café {} ha sido eliminado de la blockchain.", id_cafe);
        Ok(())
    }
}

// ==========================================
// CÓDIGOS DE ERROR
// ==========================================
#[error_code]
pub enum Errores {
    #[msg("Error: no eres el productor registrado de este café")]
    NoEresElProductor,
}

// ==========================================
// ESTRUCTURAS DE CONTEXTO (Validaciones)
// ==========================================

// Contexto para registrar un nuevo café (CREATE)
#[derive(Accounts)]
#[instruction(id_cafe: u64)]
pub struct RegistrarCafe<'info> {
    #[account(
        init,                       // Crea una nueva cuenta al llamar la instrucción
        payer = productor,          // El productor paga la transacción y la renta
        space = 8 + 32 + 8 + 54 + 54 + 54 + 34, // discriminador + Pubkey + u64 + marca + region + calidad + estado
        seeds = [b"cafe", productor.key().as_ref(), id_cafe.to_le_bytes().as_ref()], // Semillas para derivar la PDA
        bump                        // Bump para encontrar la dirección válida de la PDA
    )]
    pub cafe: Account<'info, Cafe>,

    #[account(mut)]
    pub productor: Signer<'info>,   // Quien firma y paga la transacción

    pub system_program: Program<'info, System>, // Programa del sistema necesario para crear la cuenta
}

// Contexto para actualizar el estado de un café (UPDATE)
#[derive(Accounts)]
#[instruction(id_cafe: u64)]
pub struct ActualizarCafe<'info> {
    #[account(
        mut,
        seeds = [b"cafe", productor.key().as_ref(), id_cafe.to_le_bytes().as_ref()],
        bump,
        has_one = productor          // Seguridad: solo el productor original puede actualizar
    )]
    pub cafe: Account<'info, Cafe>,

    #[account(mut)]
    pub productor: Signer<'info>,
}

// Contexto para eliminar un café (DELETE)
#[derive(Accounts)]
#[instruction(id_cafe: u64)]
pub struct EliminarCafe<'info> {
    #[account(
        mut,
        close = productor,           // Cierra la cuenta y devuelve los SOL de renta al productor
        seeds = [b"cafe", productor.key().as_ref(), id_cafe.to_le_bytes().as_ref()],
        bump,
        has_one = productor          // Seguridad: solo el productor original puede eliminar
    )]
    pub cafe: Account<'info, Cafe>,

    #[account(mut)]
    pub productor: Signer<'info>,
}

// ==========================================
// ESTADO: Estructura de datos del café
// ==========================================

#[account]
pub struct Cafe {
    pub productor: Pubkey,  // 32 bytes - Wallet del productor/dueño
    pub id_cafe: u64,       // 8 bytes  - Identificador único del café
    pub marca: String,      // 4 + 50 bytes - Marca del café (ej. "Café Chiapaneco Premium")
    pub region: String,     // 4 + 50 bytes - Región de origen (ej. "Chiapas", "Oaxaca", "Veracruz")
    pub calidad: String,    // 4 + 50 bytes - Calidad del café (ej. "Especialidad", "Premium", "Gourmet")
    pub estado: String,     // 4 + 30 bytes - Estado actual (ej. "En producción", "Tostado", "Exportado")
}
