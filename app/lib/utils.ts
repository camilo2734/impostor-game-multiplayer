import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateWord(category: string): string {
  const words: { [key: string]: string[] } = {
    'Animales': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Jirafa', 'Delfín', 'Águila', 'Cocodrilo', 'Serpiente'],
    'Comida': ['Pizza', 'Hamburguesa', 'Sushi', 'Tacos', 'Helado', 'Pasta', 'Chocolate', 'Ensalada', 'Pollo', 'Arroz'],
    'Deportes': ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Voleibol', 'Baseball', 'Golf', 'Boxeo'],
    'Películas': ['Titanic', 'Avatar', 'Matrix', 'StarWars', 'HarryPotter', 'Avengers', 'Frozen', 'Inception'],
    'Profesiones': ['Médico', 'Ingeniero', 'Profesor', 'Artista', 'Chef', 'Programador', 'Abogado', 'Arquitecto']
  };

  const categoryWords = words[category] || words['Animales'];
  return categoryWords[Math.floor(Math.random() * categoryWords.length)];
}

export function selectImpostors(playerIds: string[], count: number): string[] {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
