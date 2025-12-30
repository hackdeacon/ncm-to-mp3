# NCM to MP3 Converter

A local-only NCM file decryption tool that runs entirely in the browser.

## Features

- **Local Processing**: All decryption happens in your browser - no files are uploaded to any server
- **Batch Conversion**: Convert multiple NCM files at once
- **Audio Preview**: Listen to converted files before downloading
- **Metadata Preservation**: Album art and ID3 tags are retained
- **Dark/Light Mode**: Automatically follows your system theme

## How It Works

NCM files are encrypted FLAC/OGG files with a proprietary header. This tool:

1. **Parses the NCM file structure** - Reads the proprietary `.ncm` file format to locate encrypted data blocks
2. **Extracts the key** - Decrypts the AES key using the hardcoded public key from NCM's algorithm
3. **Decrypts the audio data** - Uses AES-CTR mode to decrypt the audio payload
4. **Handles metadata** - Parses and preserves ID3 tags and album artwork
5. **Outputs standard audio** - Produces playable MP3/FLAC files

The core decryption logic reverse-engineers NCM's encryption scheme:
- The key is encrypted with a fixed RSA public key
- The audio data uses AES-CTR encryption
- The file format includes a metadata section with cover art and ID3 info

## Disclaimer

This project is for **educational purposes only**.

- This tool does not circumvent any effective access control measures under DMCA Section 1201
- Users must legally own the original NCM files
- The developer is not responsible for any misuse
- Commercial use is not permitted

## Usage

1. Open `index.html` in a modern browser
2. Click the upload area or drag & drop `.ncm` files
3. Preview or download converted files

## License

MIT License

## Credits

Inspired by various NCM decryption projects in the community.
