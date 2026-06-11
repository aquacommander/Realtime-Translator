# Extension Icons

This folder should contain the following icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can:

1. **Use an online tool** like https://www.favicon-generator.org/ to create icons from an image
2. **Use design software** like Figma, Canva, or GIMP to create custom icons
3. **Use the provided HTML generator** below

## Quick Icon Generator (HTML/Canvas)

Create a file called `generate-icons.html` and open it in your browser:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const sizes = [16, 48, 128];
    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#4285f4');
      gradient.addColorStop(1, '#34a853');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Add globe icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = size / 16;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      ctx.stroke();
      
      // Download
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon${size}.png`;
        a.click();
      });
    });
  </script>
</body>
</html>
```

## Temporary Placeholder

For testing, you can use any PNG images renamed to the correct sizes, or use online placeholder services.

## Design Guidelines

- Use simple, recognizable symbols (globe, translation icon, captions)
- Use brand colors: Blue (#4285f4), Green (#34a853)
- Ensure icons are clear at 16x16 size
- Use transparent or solid backgrounds
- Follow Chrome Web Store design guidelines
