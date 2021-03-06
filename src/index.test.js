import {Carousel} from './index';


let mockScrollbarDimensions = null;

jest.mock('./utils/Scrollbar', () => {
	return {
		Scrollbar: class {
			get dimensions() {
				return mockScrollbarDimensions;
			}
		}
	}
});


function __fixture(count, options = null) {
	options = {id: null, ...options};

	return `
		<div class="container">
			<div class="caroucssel"${options.id ? ` id="${options.id}"` : ''}>
				${[...Array(count).keys()].map((index) => `
					<div class="item item-${index}">Item ${index}</div>
				`).join('')}
			</div>
		</div>
	`
}


describe('Caroucssel', () => {

	beforeEach(() => {
		mockScrollbarDimensions = {width: 0, height: 0};
	});


	afterEach(() => {
		document.body.innerHTML = '';
		Carousel.resetInstanceCount();
	});


	describe('core', () => {

		it('should throw an error when not passing an element', () => {
			expect(() => new Carousel())
				.toThrow(new Error('Carousel needs a dom element but "undefined" was passed.'));

			expect(() => new Carousel(true))
				.toThrow(new Error('Carousel needs a dom element but "boolean" was passed.'));

			expect(() => new Carousel({}))
				.toThrow(new Error('Carousel needs a dom element but "object" was passed.'));
		});

		it('should render empty', () => {
			document.body.innerHTML = __fixture(0);

			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el);
			expect(carousel.el).toBe(el);
		});

		it('should return given element', () => {
			document.body.innerHTML = __fixture(3);

			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el);
			expect(carousel.el).toBe(el);
		});

		it('should add id-attribute when element has no id', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');

			new Carousel(el);
			expect(/^caroucssel-[0-9]*$/.test(el.id)).toBeTruthy();
		});

		it('should create unique ids for multiple instances', () => {
			document.body.innerHTML = `${__fixture(3)}${__fixture(3)}`;
			const instances = [];
			[...document.querySelectorAll('.caroucssel')].forEach((el) =>
				instances.push(new Carousel(el)));

			expect.assertions(2);
			instances.forEach((el, index) =>
				expect(el.id).toBe(`caroucssel-${index + 1}`));
		});

		it('should not add id-attribute when element already has an id', () => {
			document.body.innerHTML = __fixture(3, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');

			new Carousel(el);
			expect(el.id).toBe('custom-id');
		});

		it('should return current index of visible item', () => {
			document.body.innerHTML = __fixture(3, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el);
			expect(carousel.index).toEqual([0]);

			el.scrollTo({left: 120});
			expect(carousel.index).toEqual([1]);
		});

		it('should return current index(s) when multiple items are visible', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 120;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 40);

			const carousel = new Carousel(el);
			expect(carousel.index).toEqual([0, 1, 2]);

			el.scrollTo({left: 120});
			expect(carousel.index).toEqual([3, 4, 5]);
		});

		it('should return current index when no items are available', () => {
			document.body.innerHTML = __fixture(0);

			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el);
			expect(carousel.index).toEqual([0]);
		});

		it('should set initial index as option', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el, {index: [2]});
			expect(carousel.index).toEqual([2]);
		});

		it('should set initial index as option when multiple items are visible', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 120;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 40);

			const carousel = new Carousel(el, {index: [2]});
			expect(carousel.index).toEqual([2, 3, 4]);
		});

		it('should return current index(s) at expected bounds', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 50);

			const carousel = new Carousel(el);
			expect(carousel.index).toEqual([0, 1]);

			el.scrollTo({left: 25});
			expect(carousel.index).toEqual([0, 1]);

			el.scrollTo({left: 26});
			expect(carousel.index).toEqual([1, 2]);

			el.scrollTo({left: 75});
			expect(carousel.index).toEqual([1, 2]);

			el.scrollTo({left: 76});
			expect(carousel.index).toEqual([2, 3]);
		});

		it('should return pages when each item is at 100% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 100);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
			]);
		});

		it('should return pages when each item is at 75% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 75);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0], [1], [2, 3], [4], [5], [6, 7], [8], [9],
			]);
		});

		it('should return pages when each item is at 66.66% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 66.66);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0], [1, 2], [3], [4, 5], [6], [7, 8], [9],
			]);
		});

		it('should return pages when each item is at 50% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 50);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0, 1], [2, 3], [4, 5], [6, 7], [8, 9],
			]);
		});

		it('should return pages when each item is at 33.33% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 33.33);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0, 1, 2], [3, 4, 5], [6, 7, 8], [9],
			]);
		});

		it('should return pages when each item is at 120% width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 120);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
			]);
		});

		it('should return pages when item is at 0px width', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 100;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 0);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			]);
		});

		it('should return pages for each item when element width is 0px', () => {
			document.body.innerHTML = __fixture(10, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			el.mockWidth = 0;
			[...document.querySelectorAll('.item')].forEach((item) => item.mockWidth = 100);

			const carousel = new Carousel(el);
			expect(carousel.pages).toEqual([
				[0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
			]);
		});

		it('should ignore <link> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('link');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore <link> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('link');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore <noscript> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('noscript');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore <script> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('script');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore <style> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('style');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore <title> in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const hidden = document.createElement('title');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(3);
		});

		it('should ignore with "hidden" attribute in items', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			el.children[0].hidden = true;

			const hidden = document.createElement('div');
			hidden.setAttribute('hidden', 'hidden');
			el.appendChild(hidden);

			const carousel = new Carousel(el);
			expect(carousel.items).toHaveLength(2);
		});

		it('should filter items based on filter function', () => {
			document.body.innerHTML = __fixture(9);
			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el, {
				filterItem: (item, index) => (index % 3) === 0
			});
			expect(carousel.items).toHaveLength(3);
		});

	});


	describe('buttons', () => {

		it('should add buttons', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const options = {
				hasButtons: true
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();
		});

		it('should add buttons with custom options', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const options = {
				hasButtons: true,
				buttonClassName: 'custom-button-class',
				buttonPrevious: {
					className: 'custom-previous-button-class',
					label: 'Custom previous label',
					title: 'Custom previous title'
				},
				buttonNext: {
					className: 'custom-next-button-class',
					label: 'Custom next label',
					title: 'Custom next title'
				}
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();
		});

		it('should add buttons with custom template', () => {
			document.body.innerHTML = __fixture(3, {id: 'custom-id'});
			const el = document.querySelector('.caroucssel');
			const options = {
				hasButtons: true,
				buttonClassName: 'custom-button-class',
				buttonPrevious: {
					className: 'custom-previous-button-class',
					label: 'Custom previous label',
					title: 'Custom previous title'
				},
				buttonNext: {
					className: 'custom-next-button-class',
					label: 'Custom next label',
					title: 'Custom next title'
				},
				buttonTemplate: jest.fn(({className, label, title}) =>
					`<span class="${className}" title="${title}">${label}</span>`)
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();
			expect(options.buttonTemplate).toHaveBeenCalledTimes(2);
			expect(options.buttonTemplate).toHaveBeenNthCalledWith(1, {
				className: 'custom-button-class custom-previous-button-class',
				controls: 'custom-id',
				label: 'Custom previous label',
				title: 'Custom previous title'
			});
			expect(options.buttonTemplate).toHaveBeenNthCalledWith(2, {
				className: 'custom-button-class custom-next-button-class',
				controls: 'custom-id',
				label: 'Custom next label',
				title: 'Custom next title'
			});
		});

	});


	describe('pagination', () => {

		it('should add pagination', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const options = {
				hasPagination: true
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();
		});

		it('should add pagination with custom options', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const options = {
				hasPagination: true,
				paginationClassName: 'custom-pagination-class',
				paginationLabel: jest.fn(({index}) => {
					switch (index) {
						case 0: return 'first';
						case 1: return 'second';
						case 2: return 'third';
						default: return 'un-defined';
					}
				}),
				paginationTitle: jest.fn(({index}) => {
					let name;
					switch (index) {
						case 0: name = 'first'; break;
						case 1: name = 'second'; break;
						case 2: name = 'third'; break;
						default: name = 'un-defined'; break;
					}
					return `Go to ${name} item`;
				})
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();

			expect(options.paginationLabel).toHaveBeenCalledTimes(3);
			expect(options.paginationLabel).toHaveBeenNthCalledWith(1, {
				index: 0,
				page: [0],
				pages: [[0], [1], [2]],
			});

			expect(options.paginationTitle).toHaveBeenCalledTimes(3);
			expect(options.paginationTitle).toHaveBeenNthCalledWith(3, {
				index: 2,
				page: [2],
				pages: [[0], [1], [2]],
			});
		});

		it('should add pagination with custom template', () => {
			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const options = {
				hasPagination: true,
				paginationClassName: 'custom-pagination-class',
				paginationLabel: jest.fn(({index}) => {
					switch (index) {
						case 0: return 'first';
						case 1: return 'second';
						case 2: return 'third';
						default: return 'un-defined';
					}
				}),
				paginationTitle: jest.fn(({index}) => {
					let name;
					switch (index) {
						case 0: name = 'first'; break;
						case 1: name = 'second'; break;
						case 2: name = 'third'; break;
						default: name = 'un-defined'; break;
					}
					return `Go to ${name} page`;
				}),
				paginationTemplate: jest.fn(({className, controls, pages, label, title}) =>
					`<div class="${className}" aria-controls="${controls}">
						${pages.map((page, index) => `
							<div class="item" aria-label="${title({index})}">
								${label({index})}
							</div>`
						).join('')}
					</div>`)
			};
			new Carousel(el, options);

			expect(document.body.innerHTML).toMatchSnapshot();
			expect(options.paginationTemplate).toHaveBeenCalledTimes(1);
		});

	});


	describe('scrollbars', () => {
		it('should wrap mask element', () => {
			mockScrollbarDimensions = {width: 15, height: 15};

			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');

			new Carousel(el);
			expect(el.parentNode.className).toBe('caroucssel-mask');
			expect(el.parentNode.style.overflow).toBe('hidden');
			expect(el.parentNode.style.height).toBe('100%');
		});

		it('should detect invisible scrollbar', () => {
			mockScrollbarDimensions = {width: 0, height: 0};

			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const style = {};

			Object.defineProperty(el, 'style', { value: style, writable: false });
			Object.defineProperty(el, 'clientWidth', { value: 600, writable: false });
			Object.defineProperty(el, 'scrollWidth', { value: 800, writable: false });

			new Carousel(el);
			expect(style).toEqual({
				marginBottom: '0px',
				height: 'calc(100% + 0px)',
			});
		});

		it('should detect visible scrollbar', () => {
			mockScrollbarDimensions = {width: 15, height: 15};

			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const style = {};

			Object.defineProperty(el, 'style', { value: style, writable: false });
			Object.defineProperty(el, 'clientWidth', { value: 600, writable: false });
			Object.defineProperty(el, 'scrollWidth', { value: 800, writable: false });

			new Carousel(el);
			expect(style).toEqual({
				marginBottom: '-15px',
				height: 'calc(100% + 15px)',
			});
		});

		it('should detect not existing scrollbar (content is smaller than container)', () => {
			mockScrollbarDimensions = {width: 15, height: 15};

			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');
			const style = {};

			Object.defineProperty(el, 'style', { value: style, writable: false });
			Object.defineProperty(el, 'clientWidth', { value: 800, writable: false });
			Object.defineProperty(el, 'scrollWidth', { value: 200, writable: false });

			new Carousel(el);
			expect(style).toEqual({
				marginBottom: '0px',
				height: 'calc(100% + 0px)',
			});
		});

		it('should use css defaults by not wrapping mask element', () => {
			mockScrollbarDimensions = {width: 1, height: 1};

			document.body.innerHTML = __fixture(3);
			const el = document.querySelector('.caroucssel');

			new Carousel(el, {hasScrollbars: true});
			expect(el.getAttribute('style')).toBeNull();
		});

	});


	describe('destroy', () => {

		it('should cleanup dom', () => {
			const structure = __fixture(3);
			document.body.innerHTML = structure;
			const el = document.querySelector('.caroucssel');
			const carousel = new Carousel(el, {
				hasButtons: true,
				hasPagination: true
			});

			carousel.destroy();
			expect(document.body.innerHTML).toBe(structure);
		});

	});

});
