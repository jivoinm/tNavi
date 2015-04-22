angular.module('tNavi.controllers', ['ngMap'])

.controller('DashCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicPlatform) {
  var _this = this;

  $ionicPlatform.ready(function() {
    // Hide the status bar
    if(window.StatusBar) {
      StatusBar.hide();
    }
  });

  $scope.activeBgImageIndex = 0;

  this.getBackgroundImage = function(lat, lng, locString) {
    Flickr.search(locString, lat, lng).then(function(resp) {
      var photos = resp.photos;
      if(photos.photo.length) {
        $scope.bgImages = photos.photo;
        _this.cycleBgImages();
      }
    }, function(error) {
      console.error('Unable to get Flickr images', error);
    });
  };

  this.getCurrent = function(lat, lng, locString) {
    Weather.getAtLocation(lat, lng).then(function(resp) {
      /*
      if(resp.response && resp.response.error) {
        alert('This Wunderground API Key has exceeded the free limit. Please use your own Wunderground key');
        return;
      }
      */
      $scope.current = resp.data;
      console.log('GOT CURRENT', $scope.current);
      $rootScope.$broadcast('scroll.refreshComplete');
    }, function(error) {
      alert('Unable to get current conditions');
      console.error(error);
    });
  };

  this.cycleBgImages = function() {
    $timeout(function cycle() {
      if($scope.bgImages) {
        $scope.activeBgImage = $scope.bgImages[$scope.activeBgImageIndex++ % $scope.bgImages.length];
      }
      //$timeout(cycle, 10000);
    });
  };

  $scope.refreshData = function() {
    Geo.getLocation().then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      Geo.reverseGeocode(lat, lng).then(function(locString) {
        $scope.currentLocationString = locString;
        _this.getBackgroundImage(lat, lng, locString);
      });
      _this.getCurrent(lat, lng);
    }, function(error) {
      alert('Unable to get current location: ' + error);
    });
  };

  $scope.refreshData();
})

.controller('MapCtrl', function($scope, MapServ, $ionicLoading, $ionicModal, $ionicActionSheet, $timeout, $state, myModals) {
  var infoWindow = new google.maps.InfoWindow();
  var poly, map;
  var markers = [];
  var path = new google.maps.MVCArray;

  function latLng2point(latLng) {
    return {
           x: (latLng.lng + 180) * (256 / 360),
           y: (256 / 2) - (256 * Math.log(Math.tan((Math.PI / 4) + ((latLng.lat * Math.PI / 180) / 2))) / (2 * Math.PI))
       };
   }

   function poly_gm2svg(gmPaths, fx) {
       var point,
       gmPath,
       svgPath,
       svgPaths = [],
           minX = 256,
           minY = 256,
           maxX = 0,
           maxY = 0;

           for (var pp = 0; pp < gmPaths.length; ++pp) {
            gmPath = gmPaths[pp], svgPath = [];
            for (var p = 0; p < gmPath.length; ++p) {
                point = latLng2point(fx(gmPath[p]));
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
                svgPath.push([point.x, point.y].join(','));
            }


            svgPaths.push(svgPath.join(' '))


        }
       return {
           path: 'M' + svgPaths.join('z M') + 'z',
           x: minX,
           y: minY,
           width: maxX - minX,
           height: maxY - minY
       };

   }

   function drawPoly(node, props) {
       var svg = node.cloneNode(false),
           g = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
           path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
       node.parentNode.replaceChild(svg, node);
       path.setAttribute('d', props.path);
       g.appendChild(path);
       svg.appendChild(g);
       svg.setAttribute('viewBox', [props.x, props.y, props.width, props.height].join(' '));
   }
   //array with encoded paths, will be decoded later
  var paths = ["wxwrGvjeyKnte@gx`@nxOfi[vzL_sg@~x_@vwi@n{d@fqpE~f^f}cA_uCfne@gzn@_cBf~X~|b@~lhAfrO~~Wnpb@ghTnyVfne@nkXw}a@v|Zfhm@~yMoav@fjIn|dAvoJgb\\vwP~kOnyo@f`g@~{B~`xAvufB~{mAveOvhK_wj@~}bAnmxAvwPo{}@fki@_`Fvgv@gdcAwlNoi|@g{u@f}j@v|Aoe`@nkjAwcZndYnmjCg|c@f`N~wq@nfyAo{}@ggMfwY~m]oa]n`VfjtAv_W~kOngoG~h~A~wgEwmU~WvhvAfn~@vj@wcs@v`^_rGfpeB~pYgit@_cBnpfC~}bAvdsAfpeBo`o@owHgyg@fwdBogn@fpZ_qkA_cfBv{eA~jlBvrgFgfjBfkqF~u`Dwj@vjYoot@wdHwlyA_}{@fpAv{l@wawAgmE~q`@~nd@wgv@fyg@onTnoBvj@o~y@wsMv_iAg{\\w~OneGwn\\gf_@fsVfhTvjYw`w@_gw@fyNfb\\__q@gjIwwi@g||@_hLnqPn~y@vghB~}P_oK_yFvae@vtm@gki@vnu@~b[vtfAw`^oey@~qy@~uc@_cBvoc@_`x@fan@woJwjkA~}mC~xF~`f@gvdAonm@oh\\~|Inwa@_|Bfn~@~mv@~z_BoirEv`w@nnToljB~pvC~dtBwzbD~ge@_dI~}PfwYgb\\v}z@f_rA_qkAojj@v{eAgnLn{oBfnwAoevDwmUwrFfqH_js@vewEotwAovpD~moAvwi@gxG_XvjYvrqAogn@ghm@vvb@~iZgqHoo[fit@~x_@geXnvZ~nvAgdj@vik@~fw@_cBgjI_j~Bfxy@niJnlFw{Sgu}@owa@nav@okX~odA~qrA_kHvwbAol_@~}P~pY~nK_{TnvlAvxp@gnpB~mv@~_x@os^v}z@fzn@wo|@_bT_}tAfbu@~uc@~ja@f_}Copb@vfVnck@wdHn~`@va~@v`pAfvk@ojj@nhC~wq@ntLnoBvhoB~rrBvesBojQvsMvlg@guKnz]npb@fan@~qrAoxOvxWvhd@oaDnpb@vgoAwkGfraAnfg@_zf@f|Jnl_@_qr@fgf@vdz@_g^~i~Bnn_Bn}@vy^~rN_fWngyBfg_A~yqB_|[nyeE_tgAn`zBgbnA_y_@v{l@~heAw~Ofk|Ho_lCfgyHv{eAvgDfhqCgm^wcAnmMoqi@w}lBvrqAgb\\~ilAwceB~hl@g}j@wvb@nwa@fhm@_dtAod@vgDvda@vg]gmEw}a@fhm@_t`Bvqq@ggxAwbl@wtTvcs@~rg@_wQ~__@nkXggf@feXgnbDg}j@wsxAn~`@gnLfps@ouiDvkvDnlqAv}bG_jZwyEgmw@n{}@vhKw{l@wxp@f}cAnwHviRfsV_mVokq@vivBf^gol@gzU~m]~wXnchDoxOobd@_hLf}j@vtm@nueAomf@wbSnmf@fb\\npI~gwAgcJwjr@wypAndr@nriAvtTwiRn_eDfwr@~ovBoul@fhxB~|b@fgf@~cb@gzn@_c[_{_B~f^ne`@f~Xoic@gqa@wqq@~fw@f^nkXfdcAvsxA_ipCvfo@~ilAwpj@g~XniJn`Voj|A~tyCfi[wg]nzv@fkP~|I~wXwmn@~ge@fki@fu}@wu[fecBwwPwn\\g}|A~`jCvoJnp{@f{\\gqH~yM~rg@gzn@ffuD~yMf}uBgtv@gjIfqa@fm^vjY_pRni|@~~mDwhd@gbu@gw@fmw@gki@gw@ntLvdz@nm_A_r`@nf`Af~q@v}lBvrnEwy^gdj@g|Jnv~Bnvs@gzn@vxWvqq@gt]fpZvbl@wuBvlN~wjAndYg{C_XoyVn_h@fx`@oeGn{}@~rg@ghm@fg_Af~Xw_W~odAfne@wjYgw@g`g@~_qAvqX~ajDwypAv_W~{t@_srB~thI_pvBncdAgwdBfxGggjCfwvC_v`DfejA_u`CvioCwmUfenDfi[~zfAvfsCnn_B_yFveh@gw}Bv|bFglmDvidAo}oDfm_G_|t@nic@wyEfbaJn{vAgE?nhiP_ccFff{Ugki@_zMvvb@vitM_uyCvbeAo~rAvmyBvj@~_x@oey@nkXo{Kv~sB_ry@ftoAgi[~xnE_hpB~iA_udFncsF_f{BgiBgso@~bfBofrBfoSvh}@oj|A_i~AvqjAghTgktB_ePf|nBfn~@~iZwik@vawAgfF_|[_{fAvky@wezAvesB_jwCntLocoC~}tB_bfAgol@_iwBwbSozwG~o}AgnwAgi[gjI_bm@gtDv`^_h~@oic@_j_J_tn@_j~B~rNovA_|xCgeX~gbDg``AvrF~pr@ocR_tn@?gqHopb@wda@veaA_tUg_y@gkPnot@~lVfkPwkzGnljBfdj@wcwCnhCosfFnnm@wfV~t\\fzUwaLn|RvsxAvky@wsMw}z@~Wvmn@gqz@widAobd@wy^n~`@ouSflWfdj@n~G_c[fqz@vcAg~XvzL~hl@nkXofg@~jHvtm@n}r@~}P_}b@graAgcnBwcs@~aToomAg}QwqXn_h@_sNg{\\o_h@fu}@neGgrh@gwYgqHg{nAva~@oK_fbt@nKoqkrBoyhAgEvzLwl`AntpB_lh@vlg@_d_DouSwabDvjkAwlrBgaUgu}@~jz@ghxBgne@gfjBfi[wfVfaUgaoG_z_Agd`EnrqGwdkT~|tA_ry@whK_}tAvsxAwk`@_rGo|dAn|R_|[fcc@nh\\v~zAw`mEv{xIgtoAnq_EnhnAney@vrjBvxp@n_OnueA_e{A_{|EorsUod}Bnte@wy^_zxA_X_fuJgrzA_tgAogkDgmxGgfFo~jT_|t@gx`@~|I_vuA_naCw{wBolx@nzDwt_Bwnu@okuCg~uCvnu@_ebA_ka@guoBvrx@_qdBnjkG?vtToriAn{}@neG~rN_mo@", "g}trJ~u`l^ngUgplAn|k@fpZ_pk@g`yAvsf@_`_@glW_ieAwn\\nfyAwkGof`AojQn`VndYfzgAotLvonBgEfbgBwda@_a_AoqPvt_Bgw@nwH_}IoxOwtfAowlBnqi@vp|Afgf@~rg@fwYwuB_qr@vb~Aggf@oiJ_jAvidA_y_@wnCfmEgu}@wjYn}r@w`E_zxAgps@fnLom_AwzwAgrOgdcAvn\\_lh@g|c@ns^owa@widAvpQffx@oic@vwPgjb@w}a@fw@_fiA_fWvcs@gyN_}b@vy^gwzFgo~Aol|CveO_wgDokq@_{xBwi}AnkXw~h@fan@g^~kaA_sg@gykCwgv@nm_An{d@nm|D~eiAnedCwh}@~eiA~nKvvb@fgM_}{@foSncR_ka@vkdC~b[vamFweh@n_iG_il@_cBof`AnpmBfvRgraAgx`@ggxAorWvg~Foyo@~t`CorbBomkJvnCghqC_oK~heA_pRogUgbu@oi}Gv`Egw}BwcAnsw@nbK_ka@~zm@fvRfrOf||@~di@opkMgbu@gan@~p@oxzA~~W~qGwqX_|[wg]vjdBflWfwkAglp@gpAo_h@fduBwk`@fvRwyEwdz@nav@g}j@fki@_p}A_~P_unA~x_@wumAwnCo}dBoyo@gbCvtTfotFwae@fimAgwr@goeAg^~msDol_@g`Nna]~ja@o|Rv|bFog`BfplAwioC~inO_hLwawAwzwAgpZgi[_ueMwl`Aw{pCgimAg{\\wyiBoojEvkGwae@vbSvwbAwj@gso@oerA_cyJfzUfwr@nmf@o|dA_ei@giBwdHgecBgyN~j~C_ei@w~sBgqH_wcAviRnot@nmMgdj@g~XgdrFokcBo|lGvvb@_bcEnyo@~`qBfiBobd@fi[gpAgwkA_xnDvcZ_jAgrOgan@fdQg}j@n~`@fiBv}Hg{nA_u\\ox~D~dPgqwDvae@~di@~gL_gpA~{BnzhBgEogkDfaUfol@gxGw{`PvceBwxwXovZ_arI~kzAgfoLvf~w@wj@vfVgseEgt]_cqDvut@njQvhaDosqH~y_AwfV_xq@wn`C~Wg}j@w}z@_mV_}Io|k@_zMvtT_af@wbiDnul@_zxAfpZnfNvu[_jZfj_DoghHn|sFw}iF~sUf}QfjIg_y@f_`@~yMvzLgan@nte@olF~v|AwzqIfyg@omM~t\\v`^~}{A_db@fshA~sgA~pYv~aAwoc@nsEn~`@vn\\ovs@~dP_oK_uu@weh@_pk@~`f@nrp@gEngU?fki@oz]wxWgw@_v|@_cBfzn@ovlAf{Coul@vgv@gf_@_n]~ep@~llDf_GovZnwa@nfNfwYflWgnLfjb@_n]n|Rgan@oey@_af@n}@_gEwoc@gm^vpj@gf_@fdcAonToaDg^v{l@w}a@oic@wgD~{mA_{m@vyEonT~nhCg{\\oiuA_q@vfhAgeXn{KouSg|c@v|Af{u@gsVneGnpb@w_{B_il@~~bBos^naDvvIgtoAwzLvkrA~wXv|Zgjb@~zTgx`@g~Xnl_@fol@wiRvu[wv{@w}HglWw{l@fiBvze@fxy@~rg@wy^vbeAohCnqi@_qr@fki@ow~CfzgAfx`@~zTnte@gt]_xX~sn@~v`Eg`yAgiBv{l@gdj@nh\\nqPvvtAgt]ggM_uu@fvk@ofN_ry@wqXnvlAff_@otLnnTv|Zwrx@fhqCgbCfjI~xFfpAf`g@vaL_cBgthBv`^w{l@ntL~ja@_dI_il@nh\\ofg@~q`@nK_zM~ilAfzU_{T_`Ff{u@n`VvcAo}oDfbzJobKgm^wv{@~lwFgo~Ao|k@vmU_`_@f_y@wgD_pk@wuB_XwmgA_pk@~dtBvl`AvjoD_y_@nf}DokX_mVovZ~~Wfcc@nqbAgt]nq_EvfV~ffFowz@vjhEwypAgu}@fhfAffcCgpZvonBwda@oul@v`Ev{wB_g^ofg@n|RnjuBwn\\wjdBw{Sn`zBgqa@omxAfan@n~oEgtDne`@_bm@nvAfeq@fjInmMvvb@glWvjr@_a_Aof`Afeq@~odA_jA~zTnqi@fm^~tCvwbAgw@gol@nrWfgf@wpQo~rAfb\\g{Cff_@nc}A_|[oqtBfb\\wu[~yf@~qrAf_Gwcs@vkGf}j@v~h@vmU_bTnr{Bf|c@nte@gso@fi[~mv@fgf@w_WfaU~xx@fiBgwYfbu@veOonTnxO~vQ~f^vs_A_mo@_mVv_p@ndr@__XvvIfdcAfhfAfyNvzbDogUn|k@_xXg`NwoJobvAoi|@wzwA~b[v~zAw_Wf{nA_tyBwhoB_laA~hSgj{@w{bEfcc@ojkGowz@~phEof`Aoe}CfiB~ctAn|k@vxiAg_GvkkBfliAvwxEfx`@w`Evda@vqcB~pr@fne@g^fi_C~yf@wi}Afqa@~lV~cInrbBn~G_wj@nnTf_G~rNfqz@gwYfgM~_qAnd}Bfrh@nbd@~hSg`N~jHgzrCfsVos^no[voc@nul@v|~BncRocR~hSfdcAoKwtm@fb\\fsV~sUftzCf{u@nhu@wvI~xx@nnm@vxW~}i@~srC~f^_|[~nd@n_h@fiBf~jAvhd@n}r@oxOfdj@nh\\vg]v~OgaUoiJf||@fzUfg_AnjQgol@vgDfmiBfjb@fyg@~tCwxbBn`o@v_iA_{TvpQwlN_tU_q@fzUnul@nmM~rNn~dCf_y@nwz@w{l@wkGolFvwi@~sgAf{`CgkPflWvwi@~hwB_|Bf~q@wmUoaDwdHweaAgdQnspAfwkA~v|AvqX_hLvhKnxzAg~q@vhd@veaAgnLvgDv}z@gyg@fqz@vlg@orWflWnhu@gj{@g^g}j@gwvCws_A_gw@_~i@_p}AoeGgniCvtm@_xjAopb@nnTnuS_nhBojj@~g~@_`x@wik@wjdB_g_GneG_jlA_gw@~iAw}z@_ugB_zf@gzgAfnL_ebA_c[nwz@whvAgdQ_sN_e{Ao|R~{mAoyV~p@w_tCgeuCfbu@nm_A~ok@npjFos^fan@gud@wzL~vQwt_Bgps@nsiBnkXoeGfm^vze@grOflWn{d@oeGvj@~wXnot@_af@vwPvxWwgDf}j@wqcBn~kBn~`@ffx@_gw@f{nAvsxAft~F_}InhgB_bTwezAorp@njQoqPg}j@_yFnerAoul@olF_tUo`o@wvmBv|eBgjb@gyN~yMnxh@gtoA_|[_mVw~aAnxOvxiA~qy@v}z@vo|@oiJnfg@~e_FgjIvp|Ao|R~yM_nD_mVwlyA~{jEwiRoz]vnCnhnA__jAgb`C_q@w|A~iAoeG", "wxp~Inrnh\\gyg@vs_AoiJozv@nnm@gwYwiRgcc@ogUnh\\vcA_`qA_r`@~rg@~}PobvAfjb@~nKo~`@_cmA~kOwu[vmUnjj@~vQ_cmAfcc@n_h@_kHnh`Cf{\\odkA_nDfbgBnqPo_h@~mD~qy@vr_@nxzAfyNgx`@ngn@~jsA_dIvjYweaAoriA~__@foeAw|ZwlNwQfkPndr@~uc@_noA~|{@ohCf|c@__jA_srBvjkA_vnBwtfAv{l@~qG_ct@", "gqvzBvdav\\~fw@__|BvhvAgejAfvvBf}gDgf_@fhm@g~|Bfb\\gps@_bm@gps@n}@", "g`~pIv_ujXo`V~iZodYofg@_cBnfyAwda@gan@weaAv_WwfV~zfAgjIgnwA~{t@w{SvqXwawA~uuA_w|A_~P~_qA~qy@oq{AvsMvu[waLgso@n}r@~ok@_`Fgan@~kaAnsEwqq@npmBwrx@nfNfoS~WwcZn~kBwpQock@", "wv`bKfjhr_@nsEnl|C__X~zT_uu@oyVvda@g|c@_sN_eqF~kaA_qvCvhKwv_D~pYfb\\ozDv~zAfan@fdcAgjb@vjYg|c@fkmCgoSfg_AvQfuKfEf^", "wum_Jn}h~X_zMnmf@ol_@waLnvZwdz@wmn@~~iAokXotLnyVgjb@gqa@_xjAfzU_yx@~cb@f}j@w`^gxy@foSw~zAvu[nsE_dIfvk@vxWoul@~_Fv`^oqi@~srC~wq@wzpBwgDonfA~qy@g`Ngxy@v}wDnlx@wxp@vlNfmw@_ieAvtfA", "oyuoJfdzt^faUg_rAf||@gpZv_WnaaCn|RoxOowsAv|{Fgdj@gt~F", "os~}IfxjtXwqnDfshAfzn@oav@?wt_BvwbAwqq@feXn~GgwkAfg_Avsf@ooBfejAgplAvnCnpb@~oRgud@w|A~c{@~zTojQ~zm@fimA_he@vjYw{Sg_y@wg]vxp@opIoqi@vyE~}i@", "_zglI~r`i^~kh@~h~A_vc@~fw@wl`Ag`yA_jZggjC~p@ogn@vxp@gm^~eW_o}@~nKf}yE", "oolxIfqowXoul@vyE_Xvmn@gtoAgtDgvRnm_AooBobd@_db@olFv}a@wt_B~e{Bot~@v}lB~_FghfA~pkAg{\\_af@nqPngn@", "gwiqIvsf`Xo_h@fgMfki@wuBvyEfxG~nKfrOw}a@vyEveh@f{Cw`^~qy@_mhAodYokXg_rAva~@gn~@fso@fmEf|c@n~`@wgDvcZgqa@whK~{[vk`@owa@ogU", "oqbfIndqz^_~P_uu@o}YnkjAg~X_xXwkG_xjAvk`@_nD_r`@gvk@~rN_g^veh@~odAftD_yx@~am@nc}AvcZnbsE_gw@gtzC", "giwzI~uakXvwbAo`V_sg@ftoAfqz@_qr@viRfh_B_jlAv_W_hLvvb@vQgpZ_mVfbu@nlFot{D", "_ihwFfbubMgan@_gpAg|JwvxD_db@g}cA~~p@~qy@g_`@ofkCf}|Av~tIoxOvqjA", "otiaJnfae\\_jZvvb@vgDwh}@wpQnmf@gbCowz@wae@_c[vg]_keCfx`@ndY_{Tn~`@f~XvQvsMfssC", "grnvI~yerXovZ~iAneGgne@wk`@nzDo}@vtm@osw@fvRg{CozoAfhm@_cBg~X__q@~rg@~{BowHnpb@n}dBf{Cwpj@vtTni|@fnLwnu@njQ", "or}nJnyy_[nwsAfyrBvoJv_iA_klB_zjCvaL__q@", "_moeIvmc__@~maC~i{F_vuAo_zAn}@_qr@weh@wQwnCwdlB", "gvr|Bnxly\\gqz@vo|@gf_@_~Pfps@_~tBfgf@fliA", "wcw`Cfzeb]wyE~fw@_nv@~q`@ouSgg_A~heAohu@fuKvu["];
  $scope.remove = function(map) {
    MapServ.remove(map);
  };

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
    $scope.places = MapServ.all();
    if($scope.places.length > 0 ){
      $ionicLoading.show({
        template: 'Loading...'
      });
      var pos = new google.maps.LatLng($scope.places[0].details.latitude, $scope.places[0].details.longitude);
      console.log(pos);
      $scope.map.setCenter(pos);
      $ionicLoading.hide();
    }

    poly = new google.maps.Polygon({
      strokeWeight: 3,
      fillColor: '#5555FF'
    });
    poly.setMap(map);
    poly.setPaths(new google.maps.MVCArray([path]));

    google.maps.event.addListener(poly, 'click', function (event) {
      $scope.showNewFieldActions(event);
    });

    $scope.addNewFieldMarker = function (event){
      path.insertAt(path.length, event.latLng);

      var marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        draggable: true
      });

      markers.push(marker);
      marker.setTitle("#" + path.length);

      google.maps.event.addListener(marker, 'click', function() {
        marker.setMap(null);
        for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
          markers.splice(i, 1);
          path.removeAt(i);
        }
      );

      google.maps.event.addListener(marker, 'dragend', function() {
        for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
          path.setAt(i, marker.getPosition());
      });

    };

    $scope.clearField = function(){
      for (var i = 0; i < markers.length; i++) {
           markers[i].setMap(null);
       }
      markers = new Array();
      path = new google.maps.MVCArray;
      poly.setPaths(new google.maps.MVCArray([path]));
    };

    $scope.drawSvgPolygon();
  });

  $scope.centerOnMe= function(){
    $ionicLoading.show({
      template: 'Loading...'
    });

    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      $scope.map.setCenter(pos);
      $ionicLoading.hide();
    });
  };

   $scope.drawSvgPolygon = function(field){
     for (var i = 0; i < paths.length; ++i) {
        paths[i] = google.maps.geometry.encoding.decodePath(paths[i]);
    }
     svgProps = poly_gm2svg(paths, function (latLng) {
        return {
            lat: latLng.lat(),
            lng: latLng.lng()
        }
     });
     drawPoly(document.getElementById('svg'), svgProps)
   };

  $scope.showFieldActions = function (ev, field){
    var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Filed Details</b>' },
       { text: '<span class="ion-android-compass">Navigate</span>' }
     ],
     destructiveText: 'Delete',
     titleText: 'Select Action on '+field.name,
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
       if(index === 0){
         //$scope.showModal('templates/fieldModal.html');
         $state.go('tab.list-detail', {placeId: field.id}, {location: false});
       }

       if(index === 1){
         $scope.drawSvgPolygon(field);
       }
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

  };

  $scope.showNewFieldActions = function (ev){
    var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Save new Filed</b>' }
     ],
     titleText: 'New field Actions',
     cancelText: 'Cancel',
     cancel: function() {
       hideSheet();
       $scope.clearField();
      },
     buttonClicked: function(index) {
       if(index === 0){
         //save field name
         var area = google.maps.geometry.spherical.computeArea(poly.getPath());
         //$scope.showModal('templates/newFieldModal.html', {area: (area.toFixed(1)/10000).toFixed(1)});
         myModals.showAddNewField({
           settings: {
             title: 'Add New Parcel'
             },
           model: {
             fields: [
               { title: 'Place name', type: 'text', require: true },
               { title: 'Year', type: 'select', require: true, show_options: '2014,2015,2016' }
             ]
           }
           }).then(function (result) {
              // result from closeModal parameter
              console.log(result);
          });
       }
       return true;
     }
   });

   $scope.saveNewField = function (){
     var model = $scope.fieldModal.scope.model;
     model.details = {
       longitude: 20.70635857720933,
       latitude: 45.39334149009799,
       coordinates: []
     };
     MapServ.add(model);
   };


  };

})

.controller('MapNaviCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('MapDetailCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('ListCtrl', function($scope, MapServ) {
  $scope.places = MapServ.all();
})

.controller('ListDetailCtrl', function($scope, $stateParams, MapServ) {
  $scope.place = MapServ.get($stateParams.placeId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
