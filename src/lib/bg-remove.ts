export async function removeBackground(
  imageSource: string
): Promise<string> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Background removal timed out")), 30000)
  );

  try {
    const result = await Promise.race([doRemove(imageSource), timeout]);
    return result;
  } catch {
    return imageSource;
  }
}

export async function removeBackgroundForDress(
  imageSource: string
): Promise<string> {
  return removeBackground(imageSource);
}

async function doRemove(imageSource: string): Promise<string> {
  const { removeBackground: imglyRemoveBg } = await import(
    "@imgly/background-removal"
  );

  const response = await fetch(imageSource);
  const blob = await response.blob();

  const resultBlob = await imglyRemoveBg(blob, {
    progress: (_key: string, _current: number, _total: number) => {},
    output: { format: "image/png", quality: 1 },
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(resultBlob);
  });
}
