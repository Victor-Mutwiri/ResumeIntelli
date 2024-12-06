export const parseHtmlContent = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const sections = [];
    const headings = doc.querySelectorAll('h2');
    
    headings.forEach(heading => {
      let content = [];
      let currentNode = heading.nextElementSibling;
      
      while (currentNode && currentNode.tagName !== 'H2') {
        if (currentNode.tagName === 'UL') {
          const items = Array.from(currentNode.querySelectorAll('li'))
            .map(li => li.textContent.trim());
          content.push({ type: 'list', items });
        } else if (currentNode.tagName === 'P') {
          content.push({ type: 'paragraph', text: currentNode.textContent.trim() });
        } else if (currentNode.tagName === 'DIV') {
          // Enhanced experience entry parsing
          const experienceTitle = currentNode.querySelector('h3')?.textContent || '';
          if (experienceTitle) {
            // Split and clean the title parts
            const titleParts = experienceTitle.split('|').map(part => part.trim());
            const company = titleParts[0];
            const role = titleParts[1];
            const duration = titleParts[2];
            
            const experienceItems = Array.from(currentNode.querySelectorAll('ul li'))
              .map(li => li.textContent.trim());
            
            content.push({ 
              type: 'experience',
              title: `${company} | ${role} | ${duration}`,
              items: experienceItems.length > 0 ? experienceItems : 
                // If no list items found, look for direct text content
                currentNode.textContent
                  .replace(experienceTitle, '')
                  .split('\n')
                  .map(text => text.trim())
                  .filter(text => text.length > 0)
            });
          }
        }
        currentNode = currentNode.nextElementSibling;
      }
      
      sections.push({
        title: heading.textContent.trim(),
        content
      });
    });
    
    return sections;
  };