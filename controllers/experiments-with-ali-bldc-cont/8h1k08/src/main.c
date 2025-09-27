#include "fw_hal.h"

#define R3 P13

void init_led()
{
    GPIO_P3_SetMode(GPIO_Pin_5, GPIO_Mode_Output_PP); // led1
}

void led_on()
{
    // GPIO_P3_SetBits(GPIO_Pin_5);
    P35 = SET;
}

void led_off()
{
    // GPIO_P3_ResetBits(GPIO_Pin_5);
    P35 = RESET;
}

int main()
{
    init_led();

    for(;;) {}

    return 0;
}