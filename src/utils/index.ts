const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const autoScroll = async (page: any, delay: number) => {
  await page.evaluate(async (delay: number) => {
    await new Promise((resolve: any, reject: any) => {
      var totalHeight = 0;
      var timer = setInterval(() => {
        var distance = 100 + Math.random() * 100;
        var scrollHeight = document.body.scrollHeight;

        window.scrollBy({ top: distance, left: 0, behavior: "smooth" });

        totalHeight += distance;
        console.info(
          "// " +
            Math.round(totalHeight) +
            "px out of " +
            scrollHeight +
            "px -> " +
            Math.round((totalHeight / scrollHeight) * 100) +
            "%"
        );
        if (totalHeight >= scrollHeight || totalHeight >= 25000) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  }, delay);
};

const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export { sleep, autoScroll, asyncForEach };
