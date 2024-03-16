const { Builder, Browser, By, Key } = require('selenium-webdriver');
const ExcelJS = require('exceljs');

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const trabajo = async () => {
  let result = [['Nombre del Libro', 'Autores', 'Citados Por', 'URL']];
  let navegador = await new Builder().forBrowser(Browser.CHROME).build();
//   await sleep(1000);
  try {
    await navegador.get('https://scholar.google.com/');
    await navegador
      .findElement(By.name('q'))
      .sendKeys('software testing', Key.RETURN);
    await sleep(6000);

    const enlaces = await navegador.findElements(
      By.css('.gs_r, .gs_or, .gs_scl')
    );
    // await sleep(1000);
    for (let enlace of enlaces) {
      nombres = await enlace.findElements(By.css('.gs_rt a'));
      autores = await enlace.findElements(By.css('.gs_a'));
      citadosPor = await enlace.findElements(By.css('.gs_ri, .gs_fl, .gs_flb'));

      const { direccion, nombre } = await buscarNombres(nombres);
      const { autor } = await buscarAutor(autores);
      const { citadoPor } = await buscarCitas(citadosPor);
      //   console.log({nombre, autor, citadoPor, direccion});
      if (direccion && nombre) {
        result.push([nombre, autor, citadoPor, direccion]);
      }
    //   await sleep(10);
    }
  } catch (ex) {
    console.error('Error encontrado', ex);
  } finally {
    await navegador.quit();
    console.table(result);
    crearExcel(result, 'Resultado_consulta_google_scholar');
  }
};

const buscarNombres = async (enlaces) => {
  let result = {};
  for (let enlace of enlaces) {
    let direccion = await enlace.getAttribute('href');
    let texto = await enlace.getAttribute('text');
    // await sleep(50);
    result = { direccion, nombre: texto };
  }
  return result;
};
const buscarAutor = async (enlaces) => {
  let result = {};
  for (let enlace of enlaces) {
    let autor = await enlace.getText();
    // await sleep(50);
    result = { autor };
  }
  return result;
};

const buscarCitas = async (enlaces) => {
  let result = {};
  for (let enlace of enlaces) {
    const citadoPor = await enlace.findElement(
      By.xpath('//a[contains(text(), "Citado por")]')
    );
    let texto = await citadoPor.getText();
    // await sleep(50);
    result = { citadoPor: texto };
  }
  return result;
};

const crearExcel = (data, nombreExcel) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('resultados_busqueda');
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  workbook.xlsx
    .writeFile(`${nombreExcel}.xlsx`)
    .then(() => {
      console.log('Archivo Excel creado exitosamente.');
    })
    .catch((error) => {
      console.log('Error al crear el archivo Excel:', error);
    });
};

trabajo();
