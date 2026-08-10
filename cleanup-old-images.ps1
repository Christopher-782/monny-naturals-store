$files = @(
  'client/public/design-reference.png',
  'client/public/logo-removebg-preview.png',
  'client/public/uploads/about/monny-about-main.png',
  'client/public/uploads/about/monny-about-spa.png',
  'client/public/uploads/hero/monny-hero-01.png',
  'client/public/uploads/hero/monny-hero-02.png',
  'client/public/uploads/catalog/beetroot-soap.jpg',
  'client/public/uploads/catalog/carrot-turmeric-soap.jpg',
  'client/public/uploads/catalog/glow-lotion.jpg',
  'client/public/uploads/catalog/glow-shower-gel.jpg',
  'client/public/uploads/catalog/hair-butter.jpg',
  'client/public/uploads/catalog/hair-shampoo.jpg',
  'client/public/uploads/catalog/herbal-growth-oil-1.jpg',
  'client/public/uploads/catalog/herbal-growth-oil-2.jpg',
  'client/public/uploads/catalog/monny-beauty-cream.jpg',
  'client/public/uploads/catalog/moringa-soap.jpg',
  'client/public/uploads/catalog/oatmeal-soap.jpg',
  'client/public/uploads/catalog/pure-coconut-oil.jpg',
  'client/public/uploads/catalog/skin-brightening-oil.jpg',
  'client/public/uploads/catalog/whitening-cream.jpg',
  'client/public/uploads/catalog/whitening-shower-gel.jpg'
)
foreach ($file in $files) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Removed $file"
  }
}
Write-Host 'Legacy images cleaned. Next run: git add -A'
