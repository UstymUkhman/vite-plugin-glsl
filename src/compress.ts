/**
 * @function
 * @name compress
 * @author aweikalee
 * @link https://github.com/aweikalee/vite-plugin-string
 *
 * @param {string} chunk Shader code to compress
 * @returns {string} Compressed shader chunk
 */
export default function (chunk: string): string {
  let newLine = false;

  return chunk
    .replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g, '')
    .split(/\n+/)
    .reduce((result, line) => {
      line = line.trim().replace(/\s{2,}|\t/, ' ');

      if (line.charAt(0) === '#') {
        newLine && result.push('\n');
        result.push(line, '\n');
        newLine = false;
      }

      else {
        result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g, '$1'));
        newLine = true;
      }

      return result;
    }, [] as string[]
  )
    .join('')
    .replace(/\n+/g, '\n');
}
