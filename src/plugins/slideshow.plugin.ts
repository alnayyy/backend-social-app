import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'slideshow',
  render() {
    const images = [
      {
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
        alt: 'Technology',
      },
      {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
        alt: 'Business',
      },
      {
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500',
        alt: 'News',
      },
      {
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
        alt: 'Innovation',
      },
    ];

    return `
      <div class="slideshow">
        <h3>📸 Featured Gallery</h3>
        <div class="slideshow-images">
          ${images
            .map(
              (img) =>
                `<img src="${img.url}" alt="${img.alt}" class="slide" loading="lazy"/>`,
            )
            .join('')}
        </div>
      </div>
    `;
  },
});
