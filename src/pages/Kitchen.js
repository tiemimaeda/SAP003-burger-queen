import React, { useEffect, useState } from 'react';
import firestore from '../utils/Firebase';
import { StyleSheet, css } from 'aphrodite';
import growl from 'growl-alert';
import 'growl-alert/dist/growl-alert.css';
import OrderCard from '../components/OrderCard';
import Button from '../components/Button';

const styles = StyleSheet.create({
  
  kitchenPage: {
    display: 'flex',    
  },

  cardOrdersContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    height: '600px',
    borderRadius: '8px',
    margin: '0% 1% 0% 1%',
    backgroundColor: '#4F4F4F',
  },
  
  title: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  
  orderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    flexWrap: 'wrap',
  },

  ordercard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '85%',
    margin: '2%',
    padding: '2%',
    backgroundColor: '#FFFDE0', 
    borderRadius: '5px',
    fontSize: '22px',
  },

  btnOrderReady: {
    margin: '3% 0 3% 0',
    width: '150px',
    height:'50px',
    backgroundColor:'green',
    borderRadius:'5px',
    border:'none',
    color: 'white',
    fontSize:'19px',
    fontWeight:'bold',
  },

});

const option = {
  fadeAway: true,
  fadeAwayTimeout: 2000,
};

function Kitchen() {
  const [pending, setPending] = useState([]);
  const [done, setDone] = useState([]);

  useEffect(() => {
    firestore
      .collection('Orders')
      .orderBy('sendTime', 'asc')
      .get().then((snapshot) => {
        const order = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
       setPending(order.filter(doc => doc.status === 'pending'))
       setDone(order.filter(doc => doc.status === 'done'))
      })
  }, []);

  function orderDone(item){
    firestore
      .collection('Orders')
      .doc(item.id)
      .update({
        status: 'done',
        time: new Date().getTime()
      })

      const newPending = pending.filter((el) => el.id !== item.id);
      setPending(newPending);

      const newDone = [...done, {...item, status: 'done', time: new Date().getTime()}];
      setDone(newDone);

      growl.success({text: 'Pedido pronto para entrega!', ...option})
  }; 

  function time(readyTime, orderTime){
    const diffTime = ((readyTime.getTime()- orderTime.getTime())) / 1000 / 60;
    if (diffTime <= 60){
    return `Pedido preparado em ${Math.abs(Math.round(diffTime))} min`;
    } else {
      const diffTime = ((readyTime.getTime()- orderTime.getTime())) / 1000 / 60 / 60;
      return `Pedido preparado em ${Math.abs(Math.round(diffTime))} horas`;
    }
  };

  return (
    <div className={css(styles.kitchenPage)}>
      <div className={css(styles.cardOrdersContainer)}>
        <p className={css(styles.title)}>PEDIDOS PENDENTES</p>
        <div className={css(styles.orderContainer)}>
          {pending.map((item) => 
          <div key={item.id} className={css(styles.ordercard)}>
            <OrderCard
              sendTime={new Date(item.sendTime).toLocaleTimeString('pt-BR')}
              table={item.table}
              customer={item.customer}
              order={item.order.map((item, index) => {
                return(
                  <div key={index}>
                    {item.count}
                    x {item.Name} {item.extra}
                  </div>
              )})}
            />
            <Button
              className={css(styles.btnOrderReady)}
              handleClick={(e) => {
                orderDone(item)
                e.preventDefault()
              }}
              title={'Pedido Pronto'}
            />
          </div>
          )}
        </div>
      </div>

      <div className={css(styles.cardOrdersContainer)}>
        <p className={css(styles.title)}>PEDIDOS PRONTOS</p>
        <div className={css(styles.orderContainer)}>
          {done.map((item) =>
          <div key={item.id} className={css(styles.ordercard)}>
            <OrderCard
              sendTime={time(new Date(item.time), new Date(item.sendTime))}
              table={item.table}
              customer={item.customer}
              orderDone={() => orderDone(item)}
              order={item.order.map((item, index) => {
                return (
                  <div key={index}>
                    {item.count}
                    x {item.Name} {item.extra}
                  </div>
                )
              })}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default Kitchen;