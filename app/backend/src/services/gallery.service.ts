import { findGalleryImages } from '../repositories/gallery.repository.js'

export async function getGalleryImages() {
  return findGalleryImages()
}