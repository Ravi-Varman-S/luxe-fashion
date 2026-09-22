let _configLoaded = false;

export async function removeBackground(
  imageSource: string
): Promise<string> {
  const { removeBackground: imglyRemoveBg } = await import(
    "@imgly/background-removal"
  );

  const response = await fetch(imageSource);
  const blob = await response.blob();

  const resultBlob = await imglyRemoveBg(blob, {
    progress: (_key: string, _current: number, _total: number) => {},
  });

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(resultBlob);
  });
}

export async function removeBackgroundForDress(
  imageSource: string
): Promise<string> {
  const { removeBackground: imglyRemoveBg } = await import(
    "@imgly/background-removal"
  );

  const response = await fetch(imageSource);
  const blob = await response.blob();

  const resultBlob = await imglyRemoveBg(blob, {
    progress: (_key: string, _current: number, _total: number) => {},
  });

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(resultBlob);
  });
}
