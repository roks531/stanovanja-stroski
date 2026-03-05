import { supabase } from './supabase';

export async function prijava(email, geslo) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: geslo
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function odjava() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function pridobiProfil(uporabnikId) {
  const { data, error } = await supabase
    .from('uporabniki')
    .select(
      `
      id,
      ime,
      priimek,
      telefon,
      email,
      aktiven,
      admin,
      uporabnik_od,
      uporabnik_do,
      soba_id
    `
    )
    .eq('id', uporabnikId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
