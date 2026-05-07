import BasePage from '../base-page';

class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product'));

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady());
    }
  }

  onReady() {
    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get("page.slug");
    // If the card is in the landing page, hide the add button and show the quantity
    if (this.source == "landing-page") {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');
      this.render();
    });

    this.render();
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  getProductBadge() {
    if (this.product?.preorder?.label) {
      return `<div class="absolute top-3 rtl:right-3 ltr:left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm z-10">${this.product.preorder.label}</div>`;
    }
    if (this.product.promotion_title) {
      return `<div class="absolute top-3 rtl:right-3 ltr:left-3 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm z-10">${this.product.promotion_title}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="absolute top-3 rtl:right-3 ltr:left-3 bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm z-10">${this.outOfStock}</div>`;
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
    }
    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="flex flex-col rtl:items-end ltr:items-start text-left">
                <h4 class="text-primary font-bold text-lg leading-none">${this.getPriceFormat(this.product.sale_price)}</h4>
                <span class="text-xs text-gray-400 line-through mt-1">${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="flex flex-col rtl:items-end ltr:items-start text-left">
                  <p class="text-[10px] text-gray-500 mb-0.5">${this.startingPrice}</p>
                  <h4 class="text-primary font-bold text-lg leading-none"> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`;
    } else {
      price = `<h4 class="text-primary font-bold text-lg leading-none text-left">${this.getPriceFormat(this.product?.price)}</h4>`;
    }
    return price;
  }

  getAddButtonLabel() {
    if (this.product.has_preorder_campaign) return salla.lang.get('pages.products.pre_order_now');
    if (this.product.status === 'sale' && this.product.type === 'booking') return salla.lang.get('pages.cart.book_now');
    if (this.product.status === 'sale') return salla.lang.get('pages.cart.add_to_cart');
    if (this.product.type !== 'donating') return salla.lang.get('pages.products.out_of_stock');
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps() {
    this.horizontal = this.hasAttribute('horizontal');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
    this.fullImage = this.hasAttribute('fullImage');
    this.minimal = this.hasAttribute('minimal');
    this.isSpecial = this.hasAttribute('isSpecial');
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  escapeHTML(str = '') {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  render() {
    this.classList.add('s-product-card-entry', 'block', 'h-full');
    this.setAttribute('id', this.product.id);
    
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    // الذكاء البرمجي: تحديد نوع المنتج لتغيير شكل الزر
    const isDigitalCourse = this.product.type === 'digital' || this.product.type === 'service';
    const btnIcon = isDigitalCourse ? 'sicon-play-circle' : 'sicon-shopping-bag';
    const btnFill = isDigitalCourse ? 'outline' : 'solid';

    // التصميم الزجاجي مع الحدود السحرية
    this.innerHTML = `
      <div class="group h-full rounded-[26px] p-[1px] bg-gradient-to-br from-white/80 via-white/20 to-gray-200/50 shadow-sm hover:shadow-apple transition-all duration-500 ease-out">
        
        <!-- البطاقة الداخلية الزجاجية -->
        <div class="bg-white/65 backdrop-blur-xl rounded-[25px] p-[5px] flex flex-col h-full relative overflow-hidden">
          
          <!-- منطقة الصورة -->
          <div class="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-gray-100">
            <a href="${this.product?.url}" class="block w-full h-full" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
              <img 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="${this.product?.image?.url || this.product?.thumbnail || this.placeholder || ''}"
                alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
                loading="lazy"
              />
            </a>
            
            ${this.getProductBadge()}

            <!-- زر المفضلة الزجاجي العائم -->
            <button
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn absolute top-3 rtl:left-3 ltr:right-3 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all duration-300 z-10 ${this.isInWishlist ? 's-product-card-wishlist-added text-red-500 pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart text-lg mt-0.5"></i>
            </button>
          </div>

          <!-- منطقة المعلومات (التقسيم الذكي) -->
          <div class="flex-1 flex flex-col p-3 pb-2">
            
            <div class="flex justify-between items-start gap-4 mb-1">
              <!-- اليمين: العنوان -->
              <div class="flex-1">
                <h3 class="text-[15px] font-bold text-gray-800 leading-snug line-clamp-2 transition-colors hover:text-primary">
                  <a href="${this.product?.url}">${this.product?.name}</a>
                </h3>
                
                ${this.product?.subtitle && !this.minimal ?
                  `<p class="text-[11px] font-medium text-gray-500 mt-1 opacity-90 line-clamp-1">${this.product?.subtitle}</p>`
                : ``}
              </div>
              
              <!-- اليسار: السعر -->
              <div class="shrink-0 pt-0.5">
                ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
              </div>
            </div>

            <!-- التقييم بالنجوم -->
            ${this.product?.rating?.stars ?
              `<div class="flex items-center text-xs font-medium text-gray-600 mb-3 mt-1">
                <i class="sicon-star2 text-yellow-400 rtl:ml-1 ltr:mr-1"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
            : `<div class="mb-3 mt-1"></div>`}

            <!-- منطقة الأزرار والإجراءات في الأسفل -->
            <div class="mt-auto pt-2 flex items-center gap-2">
              
              ${!this.hideAddBtn ?
                `<salla-add-product-button 
                  class="flex-1 transition-transform duration-300 active:scale-95"
                  fill="${btnFill}" 
                  width="wide"
                  product-id="${this.product.id}"
                  product-status="${this.product.status}"
                  product-type="${this.product.type}">
                  <div class="flex items-center justify-center gap-2 w-full">
                    ${this.product.status == 'sale' ? `<i class="text-lg ${btnIcon}"></i>` : ``}
                    <span class="font-bold text-sm whitespace-nowrap">${this.product.add_to_cart_label ? this.product.add_to_cart_label : this.getAddButtonLabel()}</span>
                  </div>
                </salla-add-product-button>`
              : ``}

              <!-- زر المشاركة السريع (لمسة إضافية لتسويق الدورات) -->
              <button 
                onclick="navigator.share ? navigator.share({title: '${this.escapeHTML(this.product.name)}', url: '${this.product.url}'}) : window.location.href='${this.product.url}'"
                class="w-10 h-10 shrink-0 rounded-full bg-gray-50 hover:bg-gray-200 border border-gray-100 flex items-center justify-center text-gray-500 transition-colors tooltip"
                aria-label="مشاركة">
                <i class="sicon-share-alt"></i>
              </button>

            </div>
          </div>
        </div>
      </div>
    `;

    // Optimistic & Per-card wishlist toggle
    this.querySelectorAll('.s-product-card-wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const willBeAdded = !btn.classList.contains('s-product-card-wishlist-added');
        app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => willBeAdded);
        app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => willBeAdded);
        
        // تبديل الألوان عند الضغط مباشرة
        if(willBeAdded) {
            btn.classList.add('text-red-500');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('text-red-500');
            btn.classList.add('text-gray-500');
        }
      });
    });
  }
}

customElements.define('custom-salla-product-card', ProductCard);