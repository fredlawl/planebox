# PlaneBox

Repository for the PlaneBox API. This API is a part of the CSC450 Software Engineering course.

Developers:

* Mohammed Alotaib
* Matthew Higgins
* Frederick Lawler
* Christopher Weddle
* Dan West

## Installation

### Requirements:

1. [NodeJS](https://nodejs.org/en/download/)

### Project Setup MacOSX/Linux
After Git and NodeJS have been installed, type the following commands into your terminal session.

1. Clone the repository
2. `cd /path/to/project/location`
3. `npm install`
4. `gulp init`
5. `gulp`

### Project Setup Windows
Install [CYGWIN](https://cygwin.com/install.html) and make sure to install all the packages. Then proceed to follow the steps described in the MacOSX/Linux section.

## Development

### HTML

The whole project is a static site. All static files are located in the **_src/static/**. Every file that has the .tpl.html extension will be compiled down into a .html file within the project root directory.

### CSS
The gulp script uses SASS for all CSS needs. See: [SASS](http://sass-lang.com/guide) to learn how to use SASS.

There is a example/well-documented file at: **_src/sass/pages/sample-page.scss**

**NOTE:** Never edit any .css files directly. They **will be overwritten** by the gulp compiler.

### Angular.js
Read the documents at [AngularJS](https://docs.angularjs.org/guide) to learn how AngularJS works.

### Gulp ETA
Read [Gulp ETA Documentation](https://github.com/40Digits/gulp-eta) for further details on using the gulp task runner.

### Deployment 

Run `gulp production` which will compile everything together for deployment.

## License

PlaneBox (c) by Frederick Lawler, Dan West, Mohammed Alotaibi, Matthew Scott, Christopher Weddle

PlaneBox is licensed under a
Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License.

You should have received a copy of the license along with this
work.  If not, see <http://creativecommons.org/licenses/by-nc-nd/3.0/>.

Creative Commons Legal Code

Attribution-NonCommercial-NoDerivs 3.0 Unported

AngularJS falls under the MIT License
