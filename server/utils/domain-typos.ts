// List of popular domains to generate lookalikes from
const popularDomains = [
  'youtube.com',
  'facebook.com',
  'instagram.com',
  'twitter.com', 
  'amazon.com',
  'netflix.com',
  'google.com',
  'microsoft.com',
  'apple.com',
  'linkedin.com',
  'reddit.com',
  'pinterest.com',
  'whatsapp.com',
  'tiktok.com',
  'spotify.com',
  'yahoo.com',
  'twitch.tv',
  'discord.com',
  'github.com',
  'dropbox.com'
];

// Typosquatting techniques
const typoFunctions = [
  // Character swapping (e.g., "youtube.com" -> "yuotube.com")
  (domain: string): string => {
    const parts = domain.split('.');
    const name = parts[0];
    if (name.length <= 3) return domain; // Don't modify very short names
    
    const pos = Math.floor(Math.random() * (name.length - 2)) + 1;
    const chars = name.split('');
    [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]]; // Swap characters
    
    return chars.join('') + '.' + parts.slice(1).join('.');
  },
  
  // Character duplication (e.g., "google.com" -> "gooogle.com")
  (domain: string): string => {
    const parts = domain.split('.');
    const name = parts[0];
    
    const pos = Math.floor(Math.random() * name.length);
    const chars = name.split('');
    chars.splice(pos, 0, chars[pos]); // Duplicate a character
    
    return chars.join('') + '.' + parts.slice(1).join('.');
  },
  
  // Character replacement (e.g., "amazon.com" -> "arnazon.com", replacing m with rn)
  (domain: string): string => {
    const replacements: Record<string, string> = {
      'm': 'rn', 'w': 'vv', 'g': 'q', 'i': 'l', 'l': '1', 'o': '0', 
      'a': 'e', 'e': 'a', 's': '5', 'n': 'r', 'c': 'k'
    };
    
    const parts = domain.split('.');
    const name = parts[0];
    
    const chars = name.split('');
    for (let i = 0; i < chars.length; i++) {
      const replacement = replacements[chars[i]];
      if (replacement && Math.random() < 0.7) { // 70% chance to replace
        chars[i] = replacement;
        break; // Only do one replacement to keep it subtle
      }
    }
    
    return chars.join('') + '.' + parts.slice(1).join('.');
  },
  
  // Missing character (e.g., "facebook.com" -> "facebok.com")
  (domain: string): string => {
    const parts = domain.split('.');
    const name = parts[0];
    if (name.length <= 4) return domain; // Don't shorten very short names
    
    const pos = Math.floor(Math.random() * name.length);
    const chars = name.split('');
    chars.splice(pos, 1); // Remove one character
    
    return chars.join('') + '.' + parts.slice(1).join('.');
  },
  
  // Domain mispelling (e.g., ".com" -> ".conm")
  (domain: string): string => {
    const misspellings: Record<string, string[]> = {
      '.com': ['.conm', '.cmo', '.ocm', '.cpm', '.cxm', '.dom', '.vom'],
      '.org': ['.ogr', '.orgg', '.orrg', '.orq', '.ort'],
      '.net': ['.nte', '.ent', '.nnet', '.neet', '.met'],
      '.edu': ['.eud', '.eddu', '.ed', '.edu.'],
      '.gov': ['.ggov', '.gob', '.gv', '.giov']
    };
    
    for (const [tld, variants] of Object.entries(misspellings)) {
      if (domain.endsWith(tld)) {
        const domainWithoutTld = domain.slice(0, -tld.length);
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        return domainWithoutTld + randomVariant;
      }
    }
    
    return domain; // No matching TLD found
  }
];

/**
 * Generates a typosquatting domain that looks similar to a popular domain
 * @returns A typosquatting domain name (e.g., "yuotube.com" or "facebok.com")
 */
export function generateTypoSquattingDomain(): string {
  // Select a random domain from the popular list
  const randomDomain = popularDomains[Math.floor(Math.random() * popularDomains.length)];
  
  // Apply a random typo function
  const randomTypoFunction = typoFunctions[Math.floor(Math.random() * typoFunctions.length)];
  
  return randomTypoFunction(randomDomain);
}