#!/bin/bash
# Process film assets: convert to WebP and rename with consistent naming

FILMS_DIR="/Users/guaco/Documents/portfolio-website/src/assets/films"

for folder in "$FILMS_DIR"/*/; do
    folder_name=$(basename "$folder")
    echo "Processing: $folder_name"
    
    # Counter for stills
    still_count=1
    
    # Process all images in folder
    for img in "$folder"*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
        [ -f "$img" ] || continue
        
        filename=$(basename "$img")
        
        # Check if it's a poster
        if [[ "$filename" == *"poster"* ]]; then
            output="$folder${folder_name}-poster.webp"
            echo "  Converting poster: $filename -> ${folder_name}-poster.webp"
        else
            # It's a still - number it sequentially
            padded=$(printf "%02d" $still_count)
            output="$folder${folder_name}-still-${padded}.webp"
            echo "  Converting still: $filename -> ${folder_name}-still-${padded}.webp"
            ((still_count++))
        fi
        
        # Convert to WebP
        cwebp -q 85 "$img" -o "$output" 2>/dev/null
        
        # Delete original if conversion succeeded
        if [ -f "$output" ]; then
            rm "$img"
        else
            echo "  ERROR: Failed to convert $filename"
        fi
    done
    
    # Remove any existing webp files that don't match our naming (like palms-still_1.1.1.webp)
    for webp in "$folder"*.webp; do
        [ -f "$webp" ] || continue
        filename=$(basename "$webp")
        if [[ ! "$filename" =~ ^${folder_name}-(still-[0-9]+|poster)\.webp$ ]]; then
            echo "  Removing old webp: $filename"
            rm "$webp"
        fi
    done
    
    echo "  Done: $folder_name"
done

echo ""
echo "All folders processed!"
