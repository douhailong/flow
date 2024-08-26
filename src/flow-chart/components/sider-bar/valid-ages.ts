export function validAges(values: any) {
  function trans(vals: any) {
    const date = { day: 1, month: 30, year: 365 };
    const rels = { gt: '>', ge: '>=', lt: '<', le: '<=', eq: '===' };
    // @ts-ignore
    return { rel: rels[vals.connSign], val: vals.paramVal * date[vals.specialParam] };
  }

  function splitRelation() {
    const result = [];
    let section = [];
    for (let i = 0; i < values.length; i++) {
      const cur = values[i];
      if (cur.checkSign === 'or') {
        result.push(section);
        section = [];
      }
      section.push(trans(cur));
      if (i + 1 === values.length) result.push(section);
    }
    return result;
  }

  function getLimitValue(relsArr: any[]) {
    return relsArr.map((rels) => {
      const limit = { max: Infinity, min: 0 };
      for (let i = 0; i < rels.length; i++) {
        const curRel = rels[i];
        if (curRel.rel === '>') {
          limit.min = Math.max(limit.min, curRel.val) + 0.009;
        }
        if (curRel.rel === '>=') {
          limit.min = Math.max(limit.min, curRel.val);
        }
        if (curRel.rel === '<') {
          limit.max = Math.min(limit.max, curRel.val) - 0.009;
        }
        if (curRel.rel === '<=') {
          limit.max = Math.min(limit.max, curRel.val);
        }
        if (curRel.rel === '===') {
        }
      }
      return limit;
    });
  }

  const relations = splitRelation();
  console.log(relations);
  const limitValue = getLimitValue(relations);

  const arr = relations.map((rels, idx) => {
    const { min, max } = limitValue[idx];
    if (min > max) return false;
    if (max === Infinity) return true;

    function getStr(val: any) {
      let basicStr = '';
      rels.forEach(
        (rel, idx) => (basicStr += `${idx === 0 ? '' : '&&'}${val}${rel.rel}${rel.val}`)
      );
      return basicStr;
    }

    for (let i = min; i < max; i++) {
      const str = getStr(i);
      if (!eval(str)) return false;
    }
    return true;
  });

  return arr;

  return arr.includes(false);
}
